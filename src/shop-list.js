import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js';
import { repeat } from '../../node_modules/lit-html/lib/repeat.js';
import { shopCommonStyle } from './shop-common-style.js';
import './shop-image.js';
import './shop-list-item.js';
import { Debouncer } from '../node_modules/@polymer/polymer/lib/utils/debounce.js';
import { microTask } from '../node_modules/@polymer/polymer/lib/utils/async.js';

import { store } from './redux/index.js';
import { updateMeta } from './redux/actions/meta.js';
import { currentCategorySelector } from './redux/reducers/categories.js';

class ShopList extends LitElement {
  render({ category, failure }) {
    return html`
    ${ shopCommonStyle }
    <style>

      .hero-image {
        position: relative;
        height: 320px;
        overflow: hidden;
        margin-bottom: 32px;
      }

      .grid {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        margin: 0 10px 32px 10px;
        padding: 0;
        list-style: none;
      }

      .grid li {
        -webkit-flex: 1 1;
        flex: 1 1;
        -webkit-flex-basis: 33%;
        flex-basis: 33%;
        max-width: 33%;
      }

      .grid a {
        display:block;
        text-decoration: none;
      }

      @media (max-width: 767px) {
        .hero-image {
          display: none;
        }

        .grid  li {
          -webkit-flex-basis: 50%;
          flex-basis: 50%;
          max-width: 50%;
        }
      }

    </style>

    <shop-image
        alt="${category.title}"
        src="${category.image}"
        placeholder="${category.placeholder}" class="hero-image"></shop-image>

    <header>
      <h1>${category.title}</h1>
      <span>${this._getPluralizedQuantity(category.items)}</span>
    </header>

    ${ !failure ? html`
      <ul class="grid">
        ${repeat(this._getListItems(category.items), item => html`
          <li>
            <a href$="${this._getItemHref(item)}"><shop-list-item item="${item}"></shop-list-item></a>
          </li>
        `)}
      </ul>` : html`
      <shop-network-warning></shop-network-warning>`
    }

  </template>
  `;
}

  static get is() { return 'shop-list'; }

  static get properties() { return {

    category: Object,

    failure: Boolean

  }}
  
  constructor() {
    super();

    store.subscribe(() => this.update());
    this.update();
  }

  update() {
    const state = store.getState();
    const category = currentCategorySelector(state);
    this.category = category;
    this.failure = category && category.failure;
  }

  connectedCallback() {
    super.connectedCallback();
    this.isAttached = true;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.isAttached = false;
  }

  _getListItems(items) {
    // Return placeholder items when the items haven't loaded yet.
    return items ? Object.values(items) : [{},{},{},{},{},{},{},{},{},{}];
  }

  _getItemHref(item) {
    // By returning null when `itemId` is undefined, the href attribute won't be set and
    // the link will be disabled.
    return item.name ? ['/detail', this.category.name, item.name].join('/') : null;
  }

  _getPluralizedQuantity(items) {
    const quantity = items ? Object.keys(items).length : 0;
    if (!quantity) {
      return '';
    }
    let pluralizedQ = quantity === 1 ? 'item' : 'items';
    return  '(' + quantity + ' ' + pluralizedQ + ')';
  }

}

customElements.define(ShopList.is, ShopList);