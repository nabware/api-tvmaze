"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = "http://api.tvmaze.com";
const MISSING_IMAGE = "https://tinyurl.com/tv-missing";
// add base URL global const


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(query) {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`${BASE_URL}/search/shows?${params}`);
  const data = await response.json();

  console.log(data);

  const shows = data.map(show => {
    let { id, name, summary, image } = show.show;

    return { id, name, summary, image: (image?.original || MISSING_IMAGE) };

  });

  console.log(shows);

  return shows;

}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4 show-container">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await fetch(`${BASE_URL}/shows/${id}/episodes`);
  const data = await response.json();

  //TODO: destructure episode param

  return data.map(({ id, name, season, number }) => ({ id, name, season, number }));
}

/** Takes in an array of episodes,
 * and populates the DOM.
 */

function displayEpisodes(episodes) {
  $episodesArea.css("display", "inline-block");
  const $episodesList = $("#episodesList");
  $episodesList.empty();

  for (const episode of episodes) {
      const episodeLi = $("<li>").text(`${episode.name} (season ${episode.season}, number ${episode.number})`);
      $episodesList.append(episodeLi);
  };
}

// add other functions that will be useful / match our structure & design

/** Takes show id and displays episodes in the DOM. */

async function getAndDisplayEpisodesOfShow(id) {
  const episodes = await getEpisodesOfShow(id);
  displayEpisodes(episodes);
}

/** Finds show id and displays episodes in the DOM on button click. */

$showsList.on("click", ".Show-getEpisodes", (evt) => {
  const $showDiv = $(evt.target).closest(".show-container");
  const showId = $showDiv.data("show-id");
  getAndDisplayEpisodesOfShow(showId);
});