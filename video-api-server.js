const express = require('express');
const cors = require('cors');
const { renderMediaOnLambda, speculateFunctionName } = require('@remotion/lambda/client');
require('dotenv').config({ path: '.env.production' });

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for CloudFront - Allow all origins for testing
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins for now (you can restrict this later)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'video-api' });
});

// Video rendering endpoint
app.post('/api/lambda/render', async (req, res) => {
  try {
    console.log('Received render request:', {
      id: req.body.id,
      hasImages: !!req.body.inputProps?.images,
      imageCount: req.body.inputProps?.images?.length || 0
    });

    // For development/testing, return a mock response
    if (!process.env.REMOTION_AWS_ACCESS_KEY_ID) {
      console.log('Remotion not configured, returning mock response');
      
      // Simulate processing delay
      setTimeout(() => {
        res.json({
          renderId: 'mock-render-id-' + Date.now(),
          bucketName: 'mock-bucket',
          outputUrl: 'https://d2dl9p7inrij8.cloudfront.net/sample-video.mp4',
          status: 'success',
          message: 'This is a mock response. Configure Remotion Lambda for actual video generation.'
        });
      }, 2000);
      return;
    }

    // Actual Remotion Lambda rendering
    const result = await renderMediaOnLambda({
      codec: 'h264',
      functionName: speculateFunctionName({
        diskSizeInMb: 2048,
        memorySizeInMb: 2048,
        timeoutInSeconds: 120,
      }),
      region: 'ap-northeast-2',
      serveUrl: process.env.REMOTION_SERVE_URL || 'https://remotion-render.s3.amazonaws.com/index.html',
      composition: req.body.id,
      inputProps: req.body.inputProps,
      framesPerLambda: 10,
      downloadBehavior: {
        type: 'download',
        fileName: 'video.mp4',
      },
    });

    console.log('Render complete:', result);
    res.json(result);
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({
      error: 'Video generation failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Progress check endpoint
app.get('/api/lambda/progress/:renderId', async (req, res) => {
  try {
    // Mock progress for testing
    res.json({
      renderId: req.params.renderId,
      progress: 0.75,
      status: 'rendering',
      message: 'Processing video...'
    });
  } catch (error) {
    console.error('Progress check error:', error);
    res.status(500).json({ error: 'Failed to check progress' });
  }
});

app.listen(PORT, () => {
  console.log(`Video API server running on port ${PORT}`);
  console.log('CORS enabled for:', [
    'https://d2dl9p7inrij8.cloudfront.net',
    'http://localhost:3000'
  ]);
  console.log('Remotion configured:', !!process.env.REMOTION_AWS_ACCESS_KEY_ID);
});