import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
  e.preventDefault();

  axios
    .post(this.action)
    .then(res => {
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      $('.heart-count').textContent = res.data.hearts.length;

      // heart animation
      if(isHearted) {
        this.heart.classList.add('heart__button--float');

        // remove heart animation after 1 second
        setTimeout(() => this.heart.classList.remove('heart__button--float'), 1000);
      }
    })
    .catch(console.error)
}

export default ajaxHeart;