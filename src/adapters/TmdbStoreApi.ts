import axios from 'axios';
import { CampaignReport } from '../domain/types';
import { evaluateCampaignStatus } from '../domain/thresholds';

import { z } from 'zod';

const TMDBMovieSchema = z.object({
    id: z.number(),
    title: z.string(),
    vote_average: z.number(),
}).passthrough();

const TMDBResponseSchema = z.object({
    results: z.array(TMDBMovieSchema),
});

export async function fetchMoviesAsCampaigns(retries = 3, delay = 1000): Promise<CampaignReport[]> {
    const accountId = process.env.TMDB_ACCOUNT_ID;
    const token = process.env.TMDB_ACCESS_TOKEN;

    if (!accountId || !token) {
        throw new Error("Missing TMDB credentials in environment variables.");
    }

    const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`;

    try {
        const response = await axios.get(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const parseResult = TMDBResponseSchema.safeParse(response.data);
        if (!parseResult.success) {
            throw new Error(`Invalid payload structure from TMDB: ${parseResult.error.message}`);
        }

        const movies = parseResult.data.results;

        return movies.map((movie: z.infer<typeof TMDBMovieSchema>) => {

            const metric = movie.vote_average;
            return {
                id: String(movie.id),
                name: movie.title,
                metric: metric,
                status: evaluateCampaignStatus(metric),
                evaluatedAt: new Date()
            };
        });

    } catch (error: any) {
        if (retries > 0) {
            console.warn(`Request failed. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(res => setTimeout(res, delay));
            return fetchMoviesAsCampaigns(retries - 1, delay * 2);
        }

        throw new Error(`Failed to fetch data after multiple attempts: ${error.message}`);
    }
}