# Coolpix.me API Integration Guide

## Overview
This guide covers integration with Leonardo AI and fal.ai for image/video generation. Choose based on pricing, speed, and quality needs.

## 1. LEONARDO AI INTEGRATION

### 1.1 Getting Started
```bash
# Get API key from: https://app.leonardo.ai/api
# Pricing: ~$0.02 per image generation
```

### 1.2 Complete Integration Class
```php
<?php
class LeonardoService {
    private $apiKey;
    private $baseUrl = 'https://cloud.leonardo.ai/api/rest/v1';
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    /**
     * Upload images for model training
     */
    public function uploadImages($imagePaths) {
        $uploadedIds = [];
        
        foreach ($imagePaths as $path) {
            // Get presigned URL
            $initResponse = $this->request('POST', '/init-image', [
                'extension' => pathinfo($path, PATHINFO_EXTENSION)
            ]);
            
            // Upload to S3
            $this->uploadToS3($initResponse['url'], $path);
            
            $uploadedIds[] = $initResponse['id'];
        }
        
        return $uploadedIds;
    }
    
    /**
     * Create dataset from uploaded images
     */
    public function createDataset($name, $imageIds) {
        return $this->request('POST', '/datasets', [
            'name' => $name,
            'description' => 'Training dataset for ' . $name,
            'images' => $imageIds
        ]);
    }
    
    /**
     * Train custom model (DreamBooth style)
     */
    public function trainModel($datasetId, $modelName) {
        $response = $this->request('POST', '/models', [
            'name' => $modelName,
            'description' => 'Custom AI model',
            'datasetId' => $datasetId,
            'instance_prompt' => 'photo of sks person',
            'modelType' => 'PORTRAIT', // or GENERAL
            'strengthType' => 'MEDIUM',
            'resolution' => 768,
            'sd_Version' => 'SDXL_0_9',
            'stylePreset' => 'PHOTOREALISTIC'
        ]);
        
        return $response['sdTrainingJob'];
    }
    
    /**
     * Check training status
     */
    public function getTrainingStatus($modelId) {
        $response = $this->request('GET', '/models/' . $modelId);
        return $response['custom_models_by_pk'];
    }
    
    /**
     * Generate image with prompt
     */
    public function generateImage($prompt, $options = []) {
        $params = array_merge([
            'prompt' => $prompt,
            'modelId' => $options['modelId'] ?? null,
            'num_images' => 1,
            'width' => 768,
            'height' => 768,
            'num_inference_steps' => 30,
            'guidance_scale' => 7,
            'scheduler' => 'EULER_DISCRETE',
            'public' => false,
            'tiling' => false,
            'negative_prompt' => 'bad quality, blurry, distorted'
        ], $options);
        
        // Remove null modelId if not set
        if (!$params['modelId']) {
            unset($params['modelId']);
        }
        
        $response = $this->request('POST', '/generations', $params);
        
        // Wait for completion
        return $this->waitForGeneration($response['sdGenerationJob']['generationId']);
    }
    
    /**
     * Try-on clothes feature
     */
    public function tryOnClothes($personImageId, $clothingImageId) {
        // Leonardo doesn't have native try-on, use img2img
        return $this->generateImage(
            'person wearing the outfit, professional photo',
            [
                'init_image_id' => $personImageId,
                'init_strength' => 0.5,
                'controlNet' => true,
                'controlNetType' => 'POSE'
            ]
        );
    }
    
    /**
     * Generate video from image (using Leonardo Motion)
     */
    public function generateVideo($imageId) {
        $response = $this->request('POST', '/generations-motion-svd', [
            'imageId' => $imageId,
            'motionStrength' => 5,
            'visibility' => 'PRIVATE'
        ]);
        
        return $this->waitForVideo($response['motionSvdGenerationJob']['generationId']);
    }
    
    /**
     * Wait for generation completion
     */
    private function waitForGeneration($generationId) {
        $maxAttempts = 60;
        
        for ($i = 0; $i < $maxAttempts; $i++) {
            $response = $this->request('GET', '/generations/' . $generationId);
            $generation = $response['generations_by_pk'];
            
            if ($generation['status'] == 'COMPLETE') {
                return [
                    'images' => array_map(function($img) {
                        return $img['url'];
                    }, $generation['generated_images']),
                    'time' => $i
                ];
            }
            
            sleep(1);
        }
        
        throw new Exception('Generation timeout');
    }
    
    /**
     * Make API request
     */
    private function request($method, $endpoint, $data = null) {
        $ch = curl_init($this->baseUrl . $endpoint);
        
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json'
            ]
        ]);
        
        if ($method === 'POST' && $data) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            throw new Exception('Leonardo API error: ' . $response);
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Upload file to S3 presigned URL
     */
    private function uploadToS3($presignedUrl, $filePath) {
        $ch = curl_init($presignedUrl);
        
        curl_setopt_array($ch, [
            CURLOPT_PUT => true,
            CURLOPT_INFILE => fopen($filePath, 'r'),
            CURLOPT_INFILESIZE => filesize($filePath),
            CURLOPT_HTTPHEADER => [
                'Content-Type: ' . mime_content_type($filePath)
            ]
        ]);
        
        curl_exec($ch);
        curl_close($ch);
    }
}
```

## 2. FAL.AI INTEGRATION

### 2.1 Getting Started
```bash
# Get API key from: https://fal.ai/dashboard
# Pricing: ~$0.01 per image (cheaper than Leonardo)
```

### 2.2 Complete Integration Class
```php
<?php
class FalAIService {
    private $apiKey;
    private $baseUrl = 'https://rest.alpha.fal.ai/v1';
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    /**
     * Train custom model using DreamBooth
     */
    public function trainModel($imagePaths, $modelName) {
        // Upload images first
        $imageUrls = $this->uploadImages($imagePaths);
        
        $response = $this->request('POST', '/fal/workflows/dreambooth/train', [
            'model_name' => $modelName,
            'images' => $imageUrls,
            'steps' => 1000,
            'learning_rate' => 1e-6,
            'instance_prompt' => 'photo of sks person',
            'class_prompt' => 'photo of person'
        ]);
        
        return $response['request_id'];
    }
    
    /**
     * Generate image with FLUX or SDXL
     */
    public function generateImage($prompt, $options = []) {
        // Use FLUX for best quality
        $model = $options['model'] ?? 'flux/dev';
        
        $params = array_merge([
            'prompt' => $prompt,
            'image_size' => 'square',
            'num_inference_steps' => 28,
            'guidance_scale' => 3.5,
            'num_images' => 1,
            'enable_safety_checker' => true
        ], $options);
        
        $response = $this->request('POST', '/fal/models/' . $model, $params);
        
        // Check if async
        if (isset($response['request_id'])) {
            return $this->waitForResult($response['request_id']);
        }
        
        return $response;
    }
    
    /**
     * Try-on clothes using IDM-VTON
     */
    public function tryOnClothes($personImage, $clothingImage) {
        $response = $this->request('POST', '/fal/models/idm-vton', [
            'human_image_url' => $personImage,
            'garment_image_url' => $clothingImage,
            'description' => 'Model wearing the garment',
            'use_auto_mask' => true,
            'use_auto_crop' => true
        ]);
        
        return $this->waitForResult($response['request_id']);
    }
    
    /**
     * Generate video using Stable Video Diffusion
     */
    public function generateVideo($imageUrl, $options = []) {
        $params = array_merge([
            'image_url' => $imageUrl,
            'motion_bucket_id' => 127,
            'cond_aug' => 0.02,
            'fps' => 6,
            'seed' => random_int(0, 9999999)
        ], $options);
        
        $response = $this->request('POST', '/fal/models/stable-video-diffusion', $params);
        
        return $this->waitForResult($response['request_id']);
    }
    
    /**
     * Image upscaling
     */
    public function upscaleImage($imageUrl) {
        $response = $this->request('POST', '/fal/models/real-esrgan', [
            'image_url' => $imageUrl,
            'scale' => 4,
            'face_enhance' => true
        ]);
        
        return $this->waitForResult($response['request_id']);
    }
    
    /**
     * Remove background
     */
    public function removeBackground($imageUrl) {
        $response = $this->request('POST', '/fal/models/rembg', [
            'image_url' => $imageUrl
        ]);
        
        return $this->waitForResult($response['request_id']);
    }
    
    /**
     * Upload images to fal.ai CDN
     */
    private function uploadImages($imagePaths) {
        $urls = [];
        
        foreach ($imagePaths as $path) {
            // Get upload URL
            $uploadData = $this->request('POST', '/storage/upload', [
                'content_type' => mime_content_type($path)
            ]);
            
            // Upload file
            $this->uploadFile($uploadData['upload_url'], $path);
            
            $urls[] = $uploadData['file_url'];
        }
        
        return $urls;
    }
    
    /**
     * Wait for async result
     */
    private function waitForResult($requestId) {
        $maxAttempts = 120;
        
        for ($i = 0; $i < $maxAttempts; $i++) {
            $response = $this->request('GET', '/requests/' . $requestId . '/status');
            
            if ($response['status'] === 'COMPLETED') {
                return $response['result'];
            } elseif ($response['status'] === 'FAILED') {
                throw new Exception('Generation failed: ' . $response['error']);
            }
            
            sleep(1);
        }
        
        throw new Exception('Generation timeout');
    }
    
    /**
     * Make API request
     */
    private function request($method, $endpoint, $data = null) {
        $ch = curl_init('https://rest.alpha.fal.ai' . $endpoint);
        
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Key ' . $this->apiKey,
                'Content-Type: application/json'
            ]
        ]);
        
        if ($method === 'POST' && $data) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    /**
     * Upload file to presigned URL
     */
    private function uploadFile($url, $filePath) {
        $ch = curl_init($url);
        
        curl_setopt_array($ch, [
            CURLOPT_PUT => true,
            CURLOPT_INFILE => fopen($filePath, 'r'),
            CURLOPT_INFILESIZE => filesize($filePath)
        ]);
        
        curl_exec($ch);
        curl_close($ch);
    }
}
```

## 3. UNIFIED API SERVICE

### 3.1 Abstraction Layer
```php
<?php
class AIService {
    private $leonardo;
    private $falai;
    private $primaryProvider;
    
    public function __construct($leonardoKey, $falKey, $primary = 'fal') {
        $this->leonardo = new LeonardoService($leonardoKey);
        $this->falai = new FalAIService($falKey);
        $this->primaryProvider = $primary;
    }
    
    /**
     * Generate image with automatic fallback
     */
    public function generateImage($prompt, $options = []) {
        try {
            if ($this->primaryProvider === 'fal') {
                return $this->falai->generateImage($prompt, $options);
            } else {
                return $this->leonardo->generateImage($prompt, $options);
            }
        } catch (Exception $e) {
            // Fallback to other provider
            error_log('Primary provider failed: ' . $e->getMessage());
            
            if ($this->primaryProvider === 'fal') {
                return $this->leonardo->generateImage($prompt, $options);
            } else {
                return $this->falai->generateImage($prompt, $options);
            }
        }
    }
    
    /**
     * Train model with best provider
     */
    public function trainModel($images, $modelName) {
        // fal.ai is usually faster for training
        return $this->falai->trainModel($images, $modelName);
    }
    
    /**
     * Try-on clothes with best provider
     */
    public function tryOnClothes($personImage, $clothingImage) {
        // fal.ai has better try-on model
        return $this->falai->tryOnClothes($personImage, $clothingImage);
    }
    
    /**
     * Generate video
     */
    public function generateVideo($imageUrl) {
        // Both support video, use primary
        if ($this->primaryProvider === 'fal') {
            return $this->falai->generateVideo($imageUrl);
        } else {
            return $this->leonardo->generateVideo($imageUrl);
        }
    }
    
    /**
     * Get provider status
     */
    public function getProviderStatus() {
        $status = [];
        
        // Check Leonardo
        try {
            $this->leonardo->request('GET', '/me');
            $status['leonardo'] = 'online';
        } catch (Exception $e) {
            $status['leonardo'] = 'offline';
        }
        
        // Check fal.ai
        try {
            $this->falai->request('GET', '/health');
            $status['fal'] = 'online';
        } catch (Exception $e) {
            $status['fal'] = 'offline';
        }
        
        return $status;
    }
}
```

## 4. USAGE EXAMPLES

### 4.1 Basic Image Generation
```php
// Initialize service
$ai = new AIService(
    $_ENV['LEONARDO_API_KEY'],
    $_ENV['FAL_API_KEY'],
    'fal' // primary provider
);

// Generate image
$result = $ai->generateImage(
    'professional headshot of a person in business attire',
    [
        'num_images' => 4,
        'image_size' => 'portrait'
    ]
);

// Display results
foreach ($result['images'] as $imageUrl) {
    echo "<img src='{$imageUrl}' />";
}
```

### 4.2 Model Training Flow
```php
// Handle user upload
$uploadedFiles = $_FILES['training_images'];
$imagePaths = [];

// Save uploads
foreach ($uploadedFiles['tmp_name'] as $key => $tmpName) {
    $path = '/tmp/' . uniqid() . '.jpg';
    move_uploaded_file($tmpName, $path);
    $imagePaths[] = $path;
}

// Start training
$trainingId = $ai->trainModel($imagePaths, 'user_' . $userId);

// Save to database
$db->prepare("
    INSERT INTO ai_models (user_id, training_id, status)
    VALUES (?, ?, 'training')
")->execute([$userId, $trainingId]);

// Return response
echo json_encode([
    'status' => 'training_started',
    'trainingId' => $trainingId
]);
```

### 4.3 Try-On Clothes Implementation
```php
// Get user's photo and clothing image
$userPhoto = $_POST['user_photo'];
$clothingUrl = $_POST['clothing_url'];

try {
    $result = $ai->tryOnClothes($userPhoto, $clothingUrl);
    
    echo json_encode([
        'success' => true,
        'image' => $result['image']['url'],
        'processingTime' => $result['metrics']['inference_time']
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Try-on failed, please try again'
    ]);
}
```

### 4.4 Video Generation
```php
// Generate video from existing image
$imageUrl = $_POST['image_url'];

$result = $ai->generateVideo($imageUrl, [
    'motion_bucket_id' => 127, // Higher = more motion
    'fps' => 8
]);

// Save video URL
$videoUrl = $result['video']['url'];

echo json_encode([
    'videoUrl' => $videoUrl,
    'duration' => $result['video']['duration']
]);
```

## 5. OPTIMIZATION TIPS

### 5.1 Cost Optimization
```php
class CostOptimizer {
    private $pricePerImage = [
        'leonardo' => 0.02,
        'fal' => 0.01
    ];
    
    public function chooseBestProvider($quality, $speed) {
        if ($quality > 8) {
            return 'leonardo'; // Better for ultra quality
        } elseif ($speed > 8) {
            return 'fal'; // Faster processing
        } else {
            return 'fal'; // Better pricing
        }
    }
    
    public function estimateMonthlyCost($imagesPerDay) {
        $falCost = $imagesPerDay * 30 * $this->pricePerImage['fal'];
        $leonardoCost = $imagesPerDay * 30 * $this->pricePerImage['leonardo'];
        
        return [
            'fal' => $falCost,
            'leonardo' => $leonardoCost,
            'savings' => $leonardoCost - $falCost
        ];
    }
}
```

### 5.2 Caching Generated Images
```php
class ImageCache {
    private $cacheDir = '/var/cache/images/';
    private $cacheTime = 86400; // 24 hours
    
    public function getCached($prompt, $params) {
        $hash = md5($prompt . json_encode($params));
        $cachePath = $this->cacheDir . $hash . '.json';
        
        if (file_exists($cachePath)) {
            $data = json_decode(file_get_contents($cachePath), true);
            if (time() - $data['created'] < $this->cacheTime) {
                return $data['images'];
            }
        }
        
        return null;
    }
    
    public function saveCache($prompt, $params, $images) {
        $hash = md5($prompt . json_encode($params));
        $cachePath = $this->cacheDir . $hash . '.json';
        
        file_put_contents($cachePath, json_encode([
            'prompt' => $prompt,
            'params' => $params,
            'images' => $images,
            'created' => time()
        ]));
    }
}
```

### 5.3 Batch Processing
```php
class BatchProcessor {
    private $queue = [];
    private $maxBatchSize = 10;
    
    public function addToQueue($userId, $prompt, $params) {
        $this->queue[] = [
            'userId' => $userId,
            'prompt' => $prompt,
            'params' => $params
        ];
        
        if (count($this->queue) >= $this->maxBatchSize) {
            $this->processBatch();
        }
    }
    
    public function processBatch() {
        $ai = new AIService($_ENV['LEONARDO_KEY'], $_ENV['FAL_KEY']);
        
        foreach ($this->queue as $job) {
            try {
                $result = $ai->generateImage($job['prompt'], $job['params']);
                $this->saveResult($job['userId'], $result);
            } catch (Exception $e) {
                $this->logError($job, $e);
            }
        }
        
        $this->queue = [];
    }
}
```

## 6. ERROR HANDLING

### 6.1 Comprehensive Error Handler
```php
class AIErrorHandler {
    private $errors = [
        'rate_limit' => 'Too many requests, please try again later',
        'invalid_key' => 'API configuration error',
        'timeout' => 'Generation is taking longer than usual',
        'nsfw' => 'Content violates guidelines',
        'insufficient_credits' => 'Not enough credits'
    ];
    
    public function handle(Exception $e) {
        $message = $e->getMessage();
        
        // Check for known errors
        foreach ($this->errors as $key => $userMessage) {
            if (stripos($message, $key) !== false) {
                return [
                    'error' => $userMessage,
                    'code' => $key,
                    'retry' => in_array($key, ['rate_limit', 'timeout'])
                ];
            }
        }
        
        // Log unknown errors
        error_log('AI Error: ' . $message);
        
        return [
            'error' => 'Something went wrong, please try again',
            'code' => 'unknown',
            'retry' => true
        ];
    }
}
```

## 7. WEBHOOKS & CALLBACKS

### 7.1 Webhook Handler
```php
// webhook.php
$payload = file_get_contents('php://input');
$data = json_decode($payload, true);

switch ($data['event']) {
    case 'training.completed':
        handleTrainingComplete($data);
        break;
    case 'generation.completed':
        handleGenerationComplete($data);
        break;
    case 'generation.failed':
        handleGenerationFailed($data);
        break;
}

function handleTrainingComplete($data) {
    $db = Database::getInstance()->getConnection();
    
    // Update model status
    $stmt = $db->prepare("
        UPDATE ai_models 
        SET status = 'completed',
            model_id = ?
        WHERE training_id = ?
    ");
    $stmt->execute([$data['model_id'], $data['training_id']]);
    
    // Notify user via email
    sendEmail($data['user_email'], 'Your AI model is ready!');
}
```

## 8. MONITORING & ANALYTICS

### 8.1 API Usage Tracker
```php
class APIUsageTracker {
    private $db;
    
    public function track($provider, $endpoint, $cost, $responseTime) {
        $stmt = $this->db->prepare("
            INSERT INTO api_usage 
            (provider, endpoint, cost, response_time, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([$provider, $endpoint, $cost, $responseTime]);
    }
    
    public function getDailyStats() {
        $stmt = $this->db->query("
            SELECT 
                provider,
                COUNT(*) as requests,
                SUM(cost) as total_cost,
                AVG(response_time) as avg_response_time
            FROM api_usage
            WHERE DATE(created_at) = CURDATE()
            GROUP BY provider
        ");
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
```

## 9. TESTING

### 9.1 API Test Suite
```php
class APITests {
    private $ai;
    
    public function __construct() {
        $this->ai = new AIService(
            $_ENV['TEST_LEONARDO_KEY'],
            $_ENV['TEST_FAL_KEY']
        );
    }
    
    public function testImageGeneration() {
        $result = $this->ai->generateImage('test portrait');
        assert(!empty($result['images']));
        echo "✓ Image generation works\n";
    }
    
    public function testProviderFailover() {
        // Force primary to fail
        $this->ai->primaryProvider = 'invalid';
        
        try {
            $result = $this->ai->generateImage('test');
            echo "✓ Failover works\n";
        } catch (Exception $e) {
            echo "✗ Failover failed\n";
        }
    }
    
    public function runAll() {
        $this->testImageGeneration();
        $this->testProviderFailover();
        // Add more tests
    }
}

// Run tests
$tests = new APITests();
$tests->runAll();
```

Remember: Always handle errors gracefully, monitor costs, and optimize for user experience!