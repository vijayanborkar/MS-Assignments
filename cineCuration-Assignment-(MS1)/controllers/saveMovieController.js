const {
  watchlist: watchlistModel,
  curatedListItem: curatedListItemModel,
  movie: movieModel,
} = require("../models");
const { movieExistsInDB, fetchMovieAndCastDetails } = require("../services");

const addToWatchlist = async (req, res) => {
    const { movieId } = req.body;

    try {
        (!(await movieExistsInDB(movieId))) {
            const {movieDetails, castDetails } = await fetchMovieAndCastDetails(movieId);
        await movieModel.create({
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            genres: movieDetails.genres.map(g => g.name).join(", "),
            actors: castDetails.map(c => c.name).join(", "),
        })
        } 

        await watchlistModel.create({movieId});
        res.status(200).json({message: "Movie added to watchlist successfully."})

    } catch (error) {
        console.error("Failed to add movie to watchlist:", error);
        res.status(500).json({error: "Failed to add movie to watchlist."});
    }
}