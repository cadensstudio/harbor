export interface Env {
	API_KEY: string;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const queryUrl = url.searchParams.get('url');
		const queryStrategy = url.searchParams.get('strategy'); // Optional strategy: mobile or desktop
		const queryCategory = url.searchParams.get('category'); // Optional category: performance, seo, etc.

		if (!queryUrl) {
			return new Response(
				JSON.stringify({
					error: 'Please provide a valid url query parameter.',
				}),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		// Default to all categories and both strategies
		const allCategories = ['performance', 'accessibility', 'best-practices', 'seo'];
		const allStrategies = ['mobile', 'desktop'];

		// Allow filtering by specific query parameters
		const categories = queryCategory ? [queryCategory] : allCategories;
		const strategies = queryStrategy ? [queryStrategy] : allStrategies;

		const results: any = {};

		// Validate user-provided categories and strategies
		const validCategories = allCategories;
		const validStrategies = allStrategies;

		if (queryCategory && !validCategories.includes(queryCategory)) {
			return new Response(
				JSON.stringify({
					error: `Invalid category '${queryCategory}'. Valid options: ${validCategories.join(', ')}`,
				}),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		if (queryStrategy && !validStrategies.includes(queryStrategy)) {
			return new Response(
				JSON.stringify({
					error: `Invalid strategy '${queryStrategy}'. Valid options: ${validStrategies.join(', ')}`,
				}),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		try {
			// Iterate through strategies and categories
			for (const strategy of strategies) {
				results[strategy] = {};

				for (const category of categories) {
					const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
						queryUrl,
					)}&strategy=${strategy}&category=${category}&key=${env.API_KEY}`;

					const response = await fetch(apiUrl);

					if (!response.ok) {
						results[strategy][category] = {
							error: `Failed to fetch data for ${category} (${strategy}).`,
						};
						continue;
					}

					const data: any = await response.json();
					const audits = data.lighthouseResult.audits;

					// Collect metrics only for the "performance" category
					const metrics =
						category === 'performance'
							? {
									firstContentfulPaint: audits['first-contentful-paint']?.displayValue,
									largestContentfulPaint: audits['largest-contentful-paint']?.displayValue,
									totalBlockingTime: audits['total-blocking-time']?.displayValue,
									cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue,
									speedIndex: audits['speed-index']?.displayValue,
								}
							: undefined;

					// Collect recommendations
					const recommendations = Object.values(audits)
						.filter(
							(audit: any) => audit.score !== 1 && (audit.scoreDisplayMode === 'metricSavings' || audit.scoreDisplayMode === 'binary'),
						)
						.map((audit: any) => ({
							title: audit.title,
							description: audit.description,
							displayValue: audit.displayValue,
							score: audit.score,
						}));

					results[strategy][category] = {
						requestedUrl: data.lighthouseResult.requestedUrl,
						finalUrl: data.lighthouseResult.finalUrl,
						overallScore: data.lighthouseResult.categories[category]?.score
							? data.lighthouseResult.categories[category]?.score * 100
							: null, // Convert score to percentage
						metrics: metrics,
						recommendations: recommendations,
					};
				}
			}

			return new Response(JSON.stringify(results, null, 2), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error: any) {
			return new Response(
				JSON.stringify({
					error: 'Internal error occurred.',
					details: error.message,
				}),
				{ status: 500, headers: { 'Content-Type': 'application/json' } },
			);
		}
	},
} satisfies ExportedHandler<Env>;
