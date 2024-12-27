import { Product } from "./Product";

// Constantes
const SERVER_URL = "http://localhost:5000";
const PRODUCTS_PER_PAGE = 9;
const productContainer = document.getElementById("product-container") as HTMLElement;
const btnCarregarMais = document.getElementById("btn-carregar-mais") as HTMLElement;
const verTodasAsCoresBtn = document.getElementById("ver-todas-as-cores") as HTMLElement;
const coresOcultas = document.querySelectorAll(".oculto");
const cartCounter = document.getElementById("count") as HTMLElement; // Contador do carrinho
const cartModal = document.getElementById("cart-modal") as HTMLElement; // Modal do Carrinho
const closeModalButton = document.getElementById("close-modal") as HTMLElement; // Fechar a modal
const cartItemsContainer = document.getElementById("cart-items") as HTMLElement; // Container para os itens no carrinho
const emptyCartButton = document.getElementById("empty-cart") as HTMLElement; // Botão para esvaziar o carrinho

// Variáveis de controle
let products: Product[] = [];
let displayedCount = 0;
let filteredProducts: Product[] = [];

// Função para obter os produtos
async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${SERVER_URL}/products`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

function applyFilters(): void {
  const colorFilters = document.querySelectorAll('input[name="color"]:checked') as NodeListOf<HTMLInputElement>;
  const sizeFilters = document.querySelectorAll('input[name="size"]:checked') as NodeListOf<HTMLInputElement>;
  const priceFilters = document.querySelectorAll('input[name="price-filter"]:checked') as NodeListOf<HTMLInputElement>;

  let filtered = [...products];

  // Filtro por cores
  const selectedColors = Array.from(colorFilters).map((checkbox) => checkbox.value);
  if (selectedColors.length > 0) {
    filtered = filtered.filter((product) => selectedColors.includes(product.color));
  }
  
  // Filtro por tamanho
  const selectedSizes = Array.from(sizeFilters).map((checkbox) => checkbox.value);
  if (selectedSizes.length > 0) {
    filtered = filtered.filter((product) => {
      // Se product.size for um array, verifica se algum tamanho corresponde ao filtro
      if (Array.isArray(product.size)) {
        return product.size.some((size) => selectedSizes.includes(size.trim()));
      } else {
        // Caso product.size seja uma string, faz a comparação direta
        return selectedSizes.includes(product.size.trim());
      }
    });
  }

  console.log(selectedSizes); // Verificar quais tamanhos estão sendo filtrados

  // Filtro por faixa de preço
  const selectedPrices = Array.from(priceFilters).map((checkbox) => checkbox.value);
  if (selectedPrices.length > 0) {
    filtered = filtered.filter((product) => {
      return selectedPrices.some((priceRange) => {
        if (priceRange === "0-50" && product.price <= 50) return true;
        if (priceRange === "51-150" && product.price > 50 && product.price <= 150) return true;
        if (priceRange === "151-300" && product.price > 150 && product.price <= 300) return true;
        if (priceRange === "301-500" && product.price > 300 && product.price <= 500) return true;
        if (priceRange === "500+" && product.price > 500) return true;
        return false;
      });
    });
  }

  filteredProducts = filtered;
  sortAndDisplayProducts(); // Exibir os produtos após a filtragem
}




// Função para aplicar a ordenação
function sortAndDisplayProducts(): void {
  const sortFilter = document.getElementById("sort-filter") as HTMLSelectElement;
  const sortValue = sortFilter.value;

  if (sortValue === "preco-crescente") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "preco-decrescente") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === "recente") {
    filteredProducts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  displayProducts(filteredProducts);
}

// Função para exibir produtos
function displayProducts(productsToDisplay: Product[]): void {
  if (!productContainer) return;

  // Limpa os produtos exibidos anteriormente
  productContainer.innerHTML = "";

  productsToDisplay.forEach((product) => {
    const productCard = createProductCard(product);
    productContainer.appendChild(productCard);
  });
}

// Função para criar o card de cada produto
function createProductCard(product: Product): HTMLElement {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");

  productCard.innerHTML = `
    <div class="img-produto">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="img-props">
      <p class="name-product">${product.name}</p>
      <p class="price-product">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
      <p class="parcelamento-product">Até ${product.parcelamento[0]}x de R$ ${product.parcelamento[1].toFixed(2).replace('.', ',')}</p>
      <p class="size-product">Tamanho: ${product.size}</p>
      <p class="color-product">Cor: ${product.color}</p>
      <button class="btn-comprar" data-product-id="${product.id}">COMPRAR</button>
    </div>
  `;

  // Adiciona evento de compra ao botão
  const buyButton = productCard.querySelector(".btn-comprar") as HTMLButtonElement;
  buyButton.addEventListener("click", () => addToCart(product));

  return productCard;
}

// Função para carregar mais produtos
function loadMoreProducts(): void {
  const nextProducts = products.slice(displayedCount, displayedCount + PRODUCTS_PER_PAGE);
  displayProducts(nextProducts);
  displayedCount += PRODUCTS_PER_PAGE;

  // Esconde o botão se não houver mais produtos para carregar
  if (displayedCount >= products.length && btnCarregarMais) {
    btnCarregarMais.style.display = "none";
  }
}


// Função para adicionar o produto ao carrinho
function addToCart(product: Product): void {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const existingProduct = cart.find((item: Product) => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
}

// Função para atualizar o contador do carrinho
function updateCartCounter(): void {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const totalItems = cart.reduce((total: number, item: Product) => total + item.quantity, 0);

  if (cartCounter) {
    cartCounter.textContent = totalItems.toString();
  }
}

// Função para abrir a modal do carrinho
function openCartModal(): void {
  cartModal.style.display = "block";
  displayCartItems();
}

// Função para exibir os itens do carrinho na modal
function displayCartItems(): void {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cartItemsContainer.innerHTML = '';

  if (cart.length > 0) {
    cart.forEach((product: Product) => {
      const item = document.createElement("div");
      item.classList.add("cart-item");
      item.innerHTML = `
        <p>${product.name} - ${product.quantity}x</p>
      `;
      cartItemsContainer.appendChild(item);
    });
  } else {
    cartItemsContainer.innerHTML = "<p>Carrinho vazio.</p>";
  }
}

// Função para esvaziar o carrinho
function emptyCart(): void {
  localStorage.removeItem("cart");
  updateCartCounter();
  displayCartItems();
}

// Evento de clique no contador do carrinho
cartCounter?.addEventListener("click", openCartModal);

// Evento de fechar a modal
closeModalButton?.addEventListener("click", () => {
  cartModal.style.display = "none";
});

// Evento de esvaziar o carrinho
emptyCartButton?.addEventListener("click", emptyCart);

// Inicializa a aplicação
async function initializeApp(): Promise<void> {
  try {
    products = await fetchProducts();
    loadMoreProducts();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }

  updateCartCounter();
}

// Evento para mostrar as cores ocultas
function mostrarCoresOcultas(): void {
  coresOcultas.forEach((cor) => cor.classList.remove("oculto"));
}

// Inicializa a aplicação após o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  verTodasAsCoresBtn?.addEventListener("click", mostrarCoresOcultas);

  // Adiciona eventos para os filtros
  document.querySelectorAll('input[name="color"], input[name="size"], input[name="price-filter"]').forEach((input) => {
    input.addEventListener("change", applyFilters);
  });
});
