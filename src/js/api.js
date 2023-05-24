

import axios from 'axios';

const URL = 'https://pixabay.com/api/';
const API_KEY = '36711729-4af54e4ddb93c330bf0d6b25a';

export default class searchImages {
  constructor() {
    this.page = 1;
    this.values = '';
    this.totalHits = 0; 
  }
  async getImages() {
    const { data } = await axios.get(
      `${URL}?key=${API_KEY}&q=${this.values}&image_type=photo&orientation=horizontal&safesearch=thue&per_page=40&page=${this.page}`
    )
        this.incrementPage();
        this.totalHits = data.totalHits;
        return data.hits;
  }
  restPage() {
    this.page = 1;
  }
  incrementPage() {
    this.page += 1;
  }
}