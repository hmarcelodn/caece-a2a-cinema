export const UNKNOWN = "<UNKNOWN>" as const;

export type MovieResult = {
  movie_title: string;
  movie_overview: string;
  movie_platforms: string[];
  movie_rating: number;
  movie_genres: string[];
  movie_cast: string[];
  movie_director: string;
  movie_release_date: string;
  movie_languages: string;
  movie_subtitles: string[];
  movie_trailer_url: string;
  movie_reason_to_watch: string;
  movie_picture_url: string;
};

export const MOCK_MOVIE_RESULT: MovieResult = {
  movie_title: "The Butterfly Effect (Efecto Mariposa)",
  movie_overview:
    "Evan Treborn sufre de pérdidas de memoria durante eventos significativos de su vida. Cuando crece, encuentra una manera de recordar estos eventos perdidos: leyendo los diarios que escribía cuando era niño. Sin embargo, descubre que cuando regresa al pasado, puede alterar el presente de maneras dramáticas e inesperadas. Cada cambio que hace crea una nueva realidad con consecuencias imprevistas, llevándolo a una espiral de intentos desesperados por arreglar su vida y la de sus seres queridos.",
  movie_platforms: ["Netflix", "Disney+"],
  movie_rating: 7.6,
  movie_genres: ["Thriller", "Drama", "Ciencia Ficción"],
  movie_cast: [
    "Ashton Kutcher",
    "Amy Smart",
    "Melora Walters",
    "Elden Henson",
    "William Lee Scott",
    "John Patrick Amedori",
    "Irene Gorovaia",
    "Kevin G. Schmidt",
  ],
  movie_director: "Eric Bress, J. Mackye Gruber",
  movie_release_date: "2004-01-23",
  movie_languages: "Inglés",
  movie_subtitles: [UNKNOWN],
  movie_trailer_url: "https://www.youtube.com/watch?v=8JVIyBGsVH0",
  movie_reason_to_watch:
    'Una fascinante exploración del concepto de viaje en el tiempo y sus consecuencias. La película presenta un thriller psicológico único que combina elementos de ciencia ficción con drama intenso. Ashton Kutcher ofrece una actuación sorprendentemente sólida en un papel dramático, alejándose de sus típicas comedias. La premisa del "efecto mariposa" - donde pequeños cambios en el pasado pueden tener enormes consecuencias en el presente - está brillantemente ejecutada, manteniendo al espectador en tensión constante. Es perfecta para quienes disfrutan de películas que hacen pensar y exploran temas profundos sobre el destino, las decisiones y las consecuencias de nuestros actos.',
  movie_picture_url:
    "https://image.tmdb.org/t/p/w500/7Szo5f7zJT0qPGzdru8e2TCq8uJ.jpg",
};

export const MOVIE_RESULT_STORAGE_KEY = "lumus-movie-result";
