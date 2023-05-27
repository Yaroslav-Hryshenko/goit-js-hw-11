import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import searchImages from './api.js';
import loadMoreBtn from './load.js';

const refs = {
  formEl: document.getElementById('search-form'),
  buttonEl: document.querySelector('.btn'),
  divEl: document.querySelector('.gallery'),
  imgEl: document.querySelector('.img-card'),
};

const options = {
  showCounter: false,
};
const newImage = new searchImages();
const newLoadMoreBtn = new loadMoreBtn('.load-more', true);
refs.formEl.addEventListener('submit', onSubmit);
newLoadMoreBtn.button.addEventListener('click', onClick);

function onSubmit(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const value = form.elements.searchQuery.value.trim();
  if (value === '') {
    return Notiflix.Notify.warning(
      'Please enter a value to search for images!'
    );
  } else {
    newImage.values = value;
    newImage.restPage();

    newLoadMoreBtn.removeBtn();
    delitMarkup();

    onClick().finally(() => {
      form.reset();
    });
  }
}
function scroll() {
  const { height: cardHeight } =
    refs.divEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onClick() {
  if (newImage.page > 1 && newImage.page > Math.ceil(newImage.totalHits / 40)) {
    newLoadMoreBtn.hideBtn();
    scroll();
    return Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }

  newLoadMoreBtn.disable();
  return getRestPage().then(() => {
    if (newImage.totalHits >= 40) {
      newLoadMoreBtn.enable();
    } else {
      newLoadMoreBtn.hideBtn();
    }
  });
}

async function getRestPage() {
  try {
    const articles = await newImage.getImages();
    // console.log(newImage.page)
    // console.log(newImage.totalHits)
    // console.log(articles);
    if (articles.length === 0) {
      throw new Error(onError);
    }

    const markup = articles.reduce(
      (markup, hit) => markup + createMarkup(hit),
      ''
    );
    if (newImage.page - 1 === 1) {
      Notiflix.Notify.success(`Hooray! We found ${newImage.totalHits} images.`);
    }

    updateMarkup(markup);
    initializeLightbox();
  } catch (err) {
    onError(err);
  }
}

function createMarkup({
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
  largeImageURL,
}) {
  return `<div class="photo-card">
  <a class="gallery__link" href='${largeImageURL}'>
<img class="img-card" src="${webformatURL}" alt="${tags}" loading="lazy"/><a>
<div class="info">
  <p class="info-item">
    <b>Likes: ${likes}</b>
  </p>
  <p class="info-item">
    <b>Views: ${views}</b>
  </p>
  <p class="info-item">
    <b>Comments: ${comments}</b>
  </p>
  <p class="info-item">
    <b>Downloads: ${downloads}</b>
  </p>
</div>
</div>`;
}

function updateMarkup(markup) {
  refs.divEl.insertAdjacentHTML('beforeend', markup);
  scroll();
}
function initializeLightbox() {
  const lightbox = new SimpleLightbox('.gallery__link', options);
  lightbox.refresh();
}
function delitMarkup() {
  refs.divEl.innerHTML = '';
}
function onError(er) {
  console.log(er);
  newLoadMoreBtn.hideBtn();
  return Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}
