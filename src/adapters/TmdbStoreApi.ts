import axios from 'axios';
import { CampaignReport } from '../domain/types';
import { evaluateCampaignStatus } from '../domain/thresholds';

interface TMDBMovie {
    id: number;
    title: string;
    vote_average: number;
}

interface TMDBResponse {
    results: TMDBMovie[];
}

export async function fetchMoviesAsCampaigns(retries = 3, delay = 1000): Promise<CampaignReport[]> {
    const accountId = process.env.TMDB_ACCOUNT_ID;
    const token = process.env.TMDB_ACCESS_TOKEN;

    if (!accountId || !token) {
        throw new Error("Missing TMDB credentials in environment variables.");
    }

    const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`;

    try {
        const response = await axios.get<TMDBResponse>(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data)
        const movies = response.data.results;


        if (!Array.isArray(movies)) {
            throw new Error("Invalid payload structure: 'results' is not an array.");
        }

        return movies.map(movie => {
            if (movie.id === undefined || !movie.title || movie.vote_average === undefined) {
                console.warn(`Missing data for movie ID: ${movie.id}. Skipping or mapping with defaults.`);
            }

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