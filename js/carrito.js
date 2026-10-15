// js/carrito.js

export class Carrito {
    #productos = new Map();

    constructor(productos, currency = '€') {
        this.currency = currency;
        productos.forEach(p => {
            this.#productos.set(p.SKU, {
                sku: p.SKU,
                title: p.title,
                price: Number(p.price),
                quantity: 0
            });
        });
    }

    actualizarUnidades(sku, unidades) {
        const producto = this.#productos.get(sku);
        if (!producto) throw new Error(`El producto ${sku} no existe`);
        const n = Number(unidades);
        if (!Number.isInteger(n) || n < 0) throw new Error('Unidades no válidas');
        producto.quantity = n;
    }

    obtenerInformacionProducto(sku) {
        const producto = this.#productos.get(sku);
        return producto ? { ...producto } : undefined;
    }

    obtenerProductos() {
        return [...this.#productos.values()].map(p => ({ ...p }));
    }

    obtenerCarrito() {
        let totalCentimos = 0;
        const productos = [];

        for (const p of this.#productos.values()) {
            if (p.quantity === 0) continue;
            const subtotalCentimos = Math.round(p.price * 100) * p.quantity;
            totalCentimos += subtotalCentimos;
            productos.push({ ...p, subtotal: (subtotalCentimos / 100).toFixed(2) });
        }

        return {
            total: (totalCentimos / 100).toFixed(2),
            currency: this.currency,
            products: productos
        };
    }
}
