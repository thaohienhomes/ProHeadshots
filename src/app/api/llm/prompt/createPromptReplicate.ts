import { NextRequest, NextResponse } from 'next/server';
import { generateImages, generateWithLora, getPredictionStatus } from '@/utils/replicateAI';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createPromptReplicate(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt,
      user_id,
      tune_id,
      model = 'sdxl',
      negative_prompt,
      width = 1024,
      height = 1024,
      num_outputs = 4,
      num_inference_steps = 25,
      guidance_scale = 7.5,
      scheduler = 'K_EULER',
      seed,
      lora_scale = 1.0,
    } = body;

    // Validate required fields
    if (!prompt || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, user_id' },
        { status: 400 }
      );
    }

    let generationResult;
    let lora_url = null;

    // If tune_id provided, get the trained model URL
    if (tune_id) {
      const { data: tuneData, error: dbError } = await supabase
        .from('tunes')
        .select('model_url, trigger_word, status')
        .eq('id', tune_id)
        .single();

      if (dbError || !tuneData) {
        return NextResponse.json(
          { error: 'Tune not found' },
          { status: 404 }
        );
      }

      if (tuneData.status !== 'succeeded') {
        return NextResponse.json(
          { error: `Tune is not ready. Status: ${tuneData.status}` },
          { status: 400 }
        );
      }

      lora_url = tuneData.model_url;

      // Generate with LoRA
      generationResult = await generateWithLora(prompt, lora_url, {
        model,
        negative_prompt,
        width,
        height,
        num_outputs,
        num_inference_steps,
        guidance_scale,
        scheduler,
        seed,
        lora_scale,
      });
    } else {
      // Generate without LoRA
      generationResult = await generateImages({
        prompt,
        model,
        negative_prompt,
        width,
        height,
        num_outputs,
        num_inference_steps,
        guidance_scale,
        scheduler,
        seed,
      });
    }

    // Save generation record to database
    const { data: promptData, error: dbError } = await supabase
      .from('prompts')
      .insert({
        user_id,
        tune_id,
        prompt,
        negative_prompt,
        replicate_prediction_id: generationResult.id,
        status: generationResult.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        provider: 'replicate',
        model_type: model,
        generation_config: {
          width,
          height,
          num_outputs,
          num_inference_steps,
          guidance_scale,
          scheduler,
          seed,
          lora_scale,
          lora_url,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save generation record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prediction_id: generationResult.id,
      prompt_id: promptData.id,
      status: generationResult.status,
      urls: generationResult.urls,
      message: 'Generation started successfully',
    });

  } catch (error) {
    console.error('Error creating Replicate prompt:', error);
    return NextResponse.json(
      { error: 'Failed to start generation' },
      { status: 500 }
    );
  }
}

// API route handler
export async function POST(request: NextRequest) {
  return createPromptReplicate(request);
}

// Get generation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('prediction_id');
    const promptId = searchParams.get('prompt_id');

    if (!predictionId && !promptId) {
      return NextResponse.json(
        { error: 'Missing prediction_id or prompt_id parameter' },
        { status: 400 }
      );
    }

    let actualPredictionId = predictionId;

    // If prompt_id provided, get prediction_id from database
    if (promptId && !predictionId) {
      const { data: promptData, error: dbError } = await supabase
        .from('prompts')
        .select('replicate_prediction_id')
        .eq('id', promptId)
        .single();

      if (dbError || !promptData) {
        return NextResponse.json(
          { error: 'Prompt not found' },
          { status: 404 }
        );
      }

      actualPredictionId = promptData.replicate_prediction_id;
    }

    // Get status from Replicate
    const statusResult = await getPredictionStatus(actualPredictionId!);

    // Update database with latest status
    if (promptId) {
      await supabase
        .from('prompts')
        .update({
          status: statusResult.status,
          updated_at: new Date().toISOString(),
          ...(statusResult.urls && { image_urls: statusResult.urls }),
          ...(statusResult.error && { error_message: statusResult.error }),
        })
        .eq('id', promptId);
    }

    return NextResponse.json({
      prediction_id: actualPredictionId,
      status: statusResult.status,
      urls: statusResult.urls,
      error: statusResult.error,
      logs: statusResult.logs,
      metrics: statusResult.metrics,
    });

  } catch (error) {
    console.error('Error getting generation status:', error);
    return NextResponse.json(
      { error: 'Failed to get generation status' },
      { status: 500 }
    );
  }
}
