import "./style.css";
import { products, type Product } from "./mock/products";

abstract class Component {
  protected parent: HTMLElement;

  constructor(targetElement: HTMLElement) {
    this.parent = targetElement;
  }

  abstract render(props?: Object): string;

  mount() {
    const componentHTML = this.render();

    this.parent.insertAdjacentHTML("beforeend", componentHTML);
  }

  click?(): void;
}

class ReactiveState<T> {
  private value: T;
  private listeners: Function[] = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  subscribe(listener: Function) {
    this.listeners.push(listener);
  }

  get() {
    return this.value;
  }

  set(newValue: T) {
    this.value = newValue;
    this.listeners.map((listener) => {
      listener();
    });
  }
}

const cartState = new ReactiveState<Product[]>([]);

class ProductCardComponent extends Component {
  private product: Product;
  private showButton: boolean;

  constructor(
    targetElement: HTMLElement,
    product: Product,
    showButton: boolean = false
  ) {
    super(targetElement);

    this.product = product;
    this.showButton = showButton;
  }

  render() {
    return `
      <div class="product-card" style="border: 1px solid #ccc; margin: 10px; padding: 10px;">
        <h2>${this.product.name}</h2>
        <p>Preço: R$ ${this.product.price}</p>
        ${
          this.showButton
            ? `<button class="add-to-cart" data-id="${this.product.id}">Adicionar ao Carrinho</button>`
            : ""
        }
      </div>
    `;
  }
}

class HomeComponent extends Component {
  render() {
    return `
      <div>
        <h1>Produtos</h1>
        <div id="home-products" class="product-list"></div>
      </div>
    `;
  }

  mount() {
    super.mount();

    const productList = document.getElementById("home-products");

    if (productList) {
      products.forEach((product) => {
        const card = new ProductCardComponent(productList, product, true);
        card.mount();
      });
    }

    const buttons = document.querySelectorAll(".add-to-cart");

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = button.getAttribute("data-id");

        if (productId) {
          const product = products.filter((p) => p.id === Number(productId))[0];

          if (product) {
            cartState.set([...cartState.get(), product]);
            console.log(cartState.get());
          }
        }
      });
    });
  }
}

class CartComponent extends Component {
  render() {
    const products = cartState.get();
    const total = products.reduce((acc, product) => acc + product.price, 0);

    return `
      <div>
        <h1>Carrinho</h1>
        <div id="cart-products" class="product-list"></div>
        <h2>Valor Total: R$ ${total}</h2>
      </div>
    `;
  }

  mount() {
    super.mount();
    const productList = document.getElementById("cart-products");
    const totalElement = document.getElementById("cart-total");

    if (productList) {
      const products = cartState.get();
      products.forEach((product) => {
        const card = new ProductCardComponent(productList, product);
        card.mount();
      });

      cartState.subscribe(() => {
        const products = cartState.get();
        productList.replaceChildren();

        products.forEach((product) => {
          const card = new ProductCardComponent(productList, product);
          card.mount();
        });

        if (totalElement) {
          const newTotal = products.reduce(
            (acc, product) => acc + product.price,
            0
          );
          totalElement.innerText = `Valor Total: R$ ${newTotal}`;
        }
      });
    }
  }
}

class HeaderComponent extends Component {
  render() {
    return `
      <nav>
        <a href="/" id="link-home">Home</a>
        <a href="/cart" id="link-cart">Carrinho (<span id="cart-length">0</span>)</a>
      </nav>
    `;
  }

  mount() {
    super.mount();

    cartState.subscribe(() => {
      const span = document.getElementById("cart-length");

      if (span) {
        span.innerText = cartState.get().length.toString();
      }
    });
  }
}

const notifyRouteChanged = () => {
  const event = new Event("route-changed");
  window.dispatchEvent(event);
};

const headerRoot = document.getElementById("header-root");
const routerOutlet = document.getElementById("router-outlet");
if (headerRoot && routerOutlet) {
  const header = new HeaderComponent(headerRoot);
  header.mount();

  const links = document.querySelectorAll('[id^="link"]');
  links.forEach(function (link) {
    const route = link.getAttribute("href");
    link.addEventListener("click", function (event) {
      event.preventDefault();
      window.history.pushState({}, "", route);
      notifyRouteChanged();
    });
  });

  const renderComponent = () => {
    const pathname = window.location.pathname;

    routerOutlet.innerHTML = "";

    switch (pathname) {
      case "/cart":
        const cart = new CartComponent(routerOutlet);
        cart.mount();
        break;
      default:
        const home = new HomeComponent(routerOutlet);
        home.mount();
        break;
    }
  };

  renderComponent();

  const handleLocationChange = () => {
    renderComponent();
  };

  window.addEventListener("route-changed", handleLocationChange);
  window.addEventListener("popstate", handleLocationChange);
}
