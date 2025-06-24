import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('Testing Polar API connection...');
    
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'POLAR_ACCESS_TOKEN not configured' },
        { status: 500 }
      );
    }
    
    // Test different API endpoints and paths
    const testCases = [
      { endpoint: 'https://api.polar.sh', path: '/v1/users/me' },
      { endpoint: 'https://sandbox-api.polar.sh', path: '/v1/users/me' },
      { endpoint: 'https://api.polar.sh', path: '/v1/organizations' },
      { endpoint: 'https://sandbox-api.polar.sh', path: '/v1/organizations' },
      { endpoint: 'https://api.polar.sh', path: '/v1/products' },
      { endpoint: 'https://sandbox-api.polar.sh', path: '/v1/products' },
    ];

    const results = [];
    let userResponse;
    let workingEndpoint;

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.endpoint}${testCase.path}`);
      try {
        const response = await fetch(`${testCase.endpoint}${testCase.path}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }

        const result = {
          endpoint: testCase.endpoint,
          path: testCase.path,
          status: response.status,
          ok: response.ok,
          response: responseData,
        };

        results.push(result);

        if (response.ok && testCase.path === '/v1/users/me') {
          userResponse = response;
          workingEndpoint = testCase.endpoint;
          console.log(`✅ Success with: ${testCase.endpoint}${testCase.path}`);
          break;
        } else if (response.ok) {
          console.log(`✅ Success with: ${testCase.endpoint}${testCase.path}`);
          if (!workingEndpoint) {
            workingEndpoint = testCase.endpoint;
          }
        } else {
          console.log(`❌ Failed: ${testCase.endpoint}${testCase.path} - ${response.status}`);
        }
      } catch (error) {
        results.push({
          endpoint: testCase.endpoint,
          path: testCase.path,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.log(`❌ Error: ${testCase.endpoint}${testCase.path} - ${error}`);
      }
    }

    // If no user endpoint worked but we have a working endpoint, continue with limited info
    if (!userResponse && !workingEndpoint) {
      return NextResponse.json(
        {
          error: 'Polar API authentication failed with all endpoints',
          results,
          tokenInfo: {
            hasToken: !!accessToken,
            tokenLength: accessToken.length,
            tokenPrefix: accessToken.substring(0, 15) + '...',
          }
        },
        { status: 500 }
      );
    }
    
    // Return results even if user endpoint failed
    return NextResponse.json({
      success: !!workingEndpoint,
      message: workingEndpoint ? 'Polar API partially accessible' : 'Polar API authentication failed',
      workingEndpoint,
      results,
      tokenInfo: {
        hasToken: !!accessToken,
        tokenLength: accessToken.length,
        tokenPrefix: accessToken.substring(0, 15) + '...',
      },
      nextSteps: [
        'Check if token has correct permissions/scopes',
        'Verify organization setup in Polar dashboard',
        'Create products in Polar dashboard if needed',
        'Test with different API endpoints'
      ]
    });
    
  } catch (error) {
    console.error('Polar API test error:', error);
    return NextResponse.json(
      { 
        error: 'Polar API test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
