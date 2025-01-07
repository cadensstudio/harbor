# Harbor PageSpeed Insights Worker

## Overview

Harbor is a lightweight and customizable Cloudflare Worker that leverages the Google PageSpeed Insights API to analyze the performance, accessibility, best practices, and SEO of a given URL. It provides actionable insights and detailed metrics that can be used to monitor, optimize, and improve website performance. Built for developers, Harbor is easy to deploy, extensible, and can be integrated into CI/CD pipelines, automated workflows, or reporting systems.

## Features

- **Multi-Category Analysis**:
  - Performance
  - Accessibility
  - Best Practices
  - SEO
- **Multi-Device Support**:
  - Desktop and Mobile analysis strategies
- **Detailed Metrics**:
  - First Contentful Paint
  - Largest Contentful Paint
  - Total Blocking Time
  - Cumulative Layout Shift
  - Speed Index
- **Actionable Recommendations**:
  - Provides specific suggestions for improvement for each category.
- **Error Handling**:
  - Ensures that failures in individual category or strategy fetches do not interrupt the overall process.

## Getting Started

### Prerequisites

1. **Cloudflare Wrangler**: Install the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) for deploying and managing Cloudflare Workers.
   ```bash
   npm install -g wrangler
   ```
2. **Google PageSpeed Insights API Key**: Obtain an API key from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

### Local Development

Use Wrangler secrets to securely store your Google API key by setting its value in your `.dev.vars` file.
```.env
API_KEY="CHANGEME"
```

### Deployment

This worker can be deployed to your Cloudflare environment by running `npm run deploy`. Make sure you set the `API_KEY` secret value on your deployed worker by running `npx wrangler secret put <KEY>`.

## Usage

### Query Parameters

| Parameter   | Required | Description                              |
|-------------|----------|------------------------------------------|
| `url`       | Yes      | The full URL to analyze.                |
| `strategy`  | No       | `mobile` or `desktop` (default: both).|
| `category`  | No       | `performance`, `accessibility`, `best-practices`, or `seo` (default: all).|

### Example Request

```bash
curl "http://localhost:8787?url=https://example.com"
```

### Sample Response

The worker returns a JSON object organized by strategy and category. Here’s an example:

```json
{
  "mobile": {
    "performance": {
      "requestedUrl": "https://example.com",
      "finalUrl": "https://example.com",
      "overallScore": 92,
      "metrics": {
        "firstContentfulPaint": "1.2 s",
        "largestContentfulPaint": "2.5 s",
        "totalBlockingTime": "0.1 s",
        "cumulativeLayoutShift": "0.01",
        "speedIndex": "3.0 s"
      },
      "recommendations": [
        {
          "title": "Enable text compression",
          "description": "Reduce the size of text-based resources",
          "displayValue": "350 ms savings",
          "score": 0.5
        }
      ]
    },
    "accessibility": {
      "requestedUrl": "https://example.com",
      "finalUrl": "https://example.com",
      "overallScore": 85,
      "recommendations": [...]
    },
    ...
  },
  "desktop": {
    "performance": { ... },
    "accessibility": { ... },
    ...
  }
}
```

### Customization

You can adapt the worker for your specific needs:
- Modify the response structure to include additional details.
- Add support for custom headers or authentication.
- Enhance error logging and monitoring using Cloudflare logs.
- Add responses for passed audits. Currently, this worker is only configured to respond with failed audits that are negatively impacting the overall score of each category.
