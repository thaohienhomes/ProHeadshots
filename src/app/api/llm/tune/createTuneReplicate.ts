import { NextRequest, NextResponse } from 'next/server';
import { trainModel, getTrainingStatus } from '@/utils/replicateAI';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createTuneReplicate(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      input_images, 
      trigger_word, 
      user_id, 
      max_train_steps = 1000,
      learning_rate = 1e-4,
      batch_size = 1,
      resolution = 1024,
      webhook 
    } = body;

    // Validate required fields
    if (!input_images || !trigger_word || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: input_images, trigger_word, user_id' },
        { status: 400 }
      );
    }

    // Start training with Replicate
    const trainingResult = await trainModel({
      input_images,
      trigger_word,
      max_train_steps,
      learning_rate,
      batch_size,
      resolution,
      webhook,
    });

    // Save training record to database
    const { data: tuneData, error: dbError } = await supabase
      .from('tunes')
      .insert({
        user_id,
        replicate_training_id: trainingResult.id,
        trigger_word,
        status: trainingResult.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        provider: 'replicate',
        model_type: 'sdxl-lora',
        training_config: {
          max_train_steps,
          learning_rate,
          batch_size,
          resolution,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save training record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      training_id: trainingResult.id,
      tune_id: tuneData.id,
      status: trainingResult.status,
      message: 'Training started successfully',
    });

  } catch (error) {
    console.error('Error creating Replicate tune:', error);
    return NextResponse.json(
      { error: 'Failed to start training' },
      { status: 500 }
    );
  }
}

// API route handler
export async function POST(request: NextRequest) {
  return createTuneReplicate(request);
}

// Get training status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trainingId = searchParams.get('training_id');
    const tuneId = searchParams.get('tune_id');

    if (!trainingId && !tuneId) {
      return NextResponse.json(
        { error: 'Missing training_id or tune_id parameter' },
        { status: 400 }
      );
    }

    let actualTrainingId = trainingId;

    // If tune_id provided, get training_id from database
    if (tuneId && !trainingId) {
      const { data: tuneData, error: dbError } = await supabase
        .from('tunes')
        .select('replicate_training_id')
        .eq('id', tuneId)
        .single();

      if (dbError || !tuneData) {
        return NextResponse.json(
          { error: 'Tune not found' },
          { status: 404 }
        );
      }

      actualTrainingId = tuneData.replicate_training_id;
    }

    // Get status from Replicate
    const statusResult = await getTrainingStatus(actualTrainingId!);

    // Update database with latest status
    if (tuneId) {
      await supabase
        .from('tunes')
        .update({
          status: statusResult.status,
          updated_at: new Date().toISOString(),
          ...(statusResult.output && { model_url: statusResult.output.weights }),
          ...(statusResult.error && { error_message: statusResult.error }),
        })
        .eq('id', tuneId);
    }

    return NextResponse.json({
      training_id: actualTrainingId,
      status: statusResult.status,
      output: statusResult.output,
      error: statusResult.error,
      logs: statusResult.logs,
    });

  } catch (error) {
    console.error('Error getting training status:', error);
    return NextResponse.json(
      { error: 'Failed to get training status' },
      { status: 500 }
    );
  }
}
