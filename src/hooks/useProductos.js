import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseclient";
import { useEmpresa } from "../contexts/empresacontext";

export function useProductos() {
    const [productos, setProductos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { empresaId } = useEmpresa();

    useEffect(() => {
        if (!empresaId) return;

        const fetchProductos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from("productos")
                    .select(`id_producto,
                        codigo_sku,
                        nombre,
                        descripcion,
                        precio_compra,
                        precio_venta,
                        stock,
                        stock_minimo,
                        unidades_medidas(nombre),
                        estado,
                        fecha_registro,
                        categorias_producto(nombre),
                        proveedores(nombre_comercial),
                        fecha_vencimiento`)
                    .eq("id_empresa", empresaId)
                    .order("nombre", { ascending: true });

                if (error) throw error;
                setProductos(data || []);
            } catch (err) {
                setError(err.message);
                console.error("Error al cargar productos:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProductos();
    }, [empresaId]);

    const generarSku = async (nombreProducto) => {

        if (!nombreProducto) return null;

        const base = nombreProducto
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z]/g, "")
            .substring(0, 3);

        const { data, error } = await supabase
            .from("productos")
            .select("codigo_sku")
            .eq("id_empresa", empresaId)
            .ilike("codigo_sku", `SKU-${base}-%`);
        if (error) {
            console.error("Error al verificar SKU:", error);
            return `SKU-${base}-001`;
        }
        const siguienteNumero = (data?.length || 0) + 1;
        const numeroFormateado = String(siguienteNumero).padStart(3, "0");
        return `SKU-${base}-${numeroFormateado}`;

    };

    const agregarProducto = async (nuevoProducto, infoPago) => {
        setIsLoading(true);
        setError(null);

        if (!empresaId) {
            toast.error("No hay empresa seleccionada.");
            setIsLoading(false);
            return { success: false, message: "No hay empresa seleccionada." };
        }

        const ID_CUENTA_INVENTARIO = 7;
        const ID_CUENTA_PROVEEDORES = 5;
        const ID_CUENTA_CAJA = 1; // ¡Verifica este ID!

        try {
            // --- 1. Definir el objeto a insertar ---
            const productoParaInsertar = {
                ...nuevoProducto, // Esto viene del formulario
                id_empresa: empresaId // Añadimos el id_empresa
            };

            // --- 2. Completar la consulta de inserción y selección ---
            const { data: dataProducto, error: errorProducto } = await supabase
                .from("productos")
                .insert(productoParaInsertar)
                .select(`
                    id_producto,
                    codigo_sku,
                    nombre,
                    descripcion,
                    precio_compra,
                    precio_venta,
                    stock,
                    stock_minimo,
                    unidades_medidas(nombre),
                    estado,
                    fecha_registro,
                    categorias_producto(nombre),
                    proveedores(nombre_comercial),
                    fecha_vencimiento
                `)
                .single(); // Insertamos uno, seleccionamos uno

            if (errorProducto) throw errorProducto;

            // 3. Validar que dataProducto exista antes de actualizar el estado
            if (dataProducto) {
                setProductos((prev) => [...prev, dataProducto]);
            } else {
                throw new Error("El producto se creó, pero no se pudo recuperar.");
            }

            // --- 4. Lógica Contable (esto ya lo tenías bien) ---
            const costoTotal = (nuevoProducto.precio_compra || 0) * (nuevoProducto.stock || 0);
            if (costoTotal <= 0) {
                return { success: true };
            }

            const fechaActual = new Date().toISOString().slice(0, 10);
            const movimientosParaInsertar = [];

            // ... (Tu lógica de DEBE y HABER de partida doble va aquí) ...
            // 1. El DEBE (Aumento de Inventario)
            movimientosParaInsertar.push({
                id_empresa: empresaId,
                id_cuenta: ID_CUENTA_INVENTARIO,
                fecha: fechaActual,
                tipo: 'DEBE',
                monto: costoTotal,
                descripcion: `Stock inicial: ${nuevoProducto.nombre}`
            });

            // 2. El HABER (Cómo se pagó)
            if (infoPago.tipo === 'credito') {
                movimientosParaInsertar.push({
                    id_empresa: empresaId,
                    id_cuenta: ID_CUENTA_PROVEEDORES,
                    fecha: fechaActual,
                    tipo: 'HABER',
                    monto: costoTotal,
                    descripcion: `Compra a crédito stock: ${nuevoProducto.nombre}`
                });
            } else if (infoPago.tipo === 'efectivo') {
                movimientosParaInsertar.push({
                    id_empresa: empresaId,
                    id_cuenta: ID_CUENTA_CAJA,
                    fecha: fechaActual,
                    tipo: 'HABER',
                    monto: costoTotal,
                    descripcion: `Compra efectivo stock: ${nuevoProducto.nombre}`
                });
            } else if (infoPago.tipo === 'parcial') {
                const montoEfectivo = infoPago.montoEfectivo || 0;
                const montoCredito = costoTotal - montoEfectivo;

                if (montoEfectivo > 0) {
                    movimientosParaInsertar.push({
                        id_empresa: empresaId,
                        id_cuenta: ID_CUENTA_CAJA,
                        fecha: fechaActual,
                        tipo: 'HABER',
                        monto: montoEfectivo,
                        descripcion: `Pago efectivo stock: ${nuevoProducto.nombre}`
                    });
                }
                if (montoCredito > 0) {
                    movimientosParaInsertar.push({
                        id_empresa: empresaId,
                        id_cuenta: ID_CUENTA_PROVEEDORES,
                        fecha: fechaActual,
                        tipo: 'HABER',
                        monto: montoCredito,
                        descripcion: `Crédito stock: ${nuevoProducto.nombre}`
                    });
                }
            }
            // ...
            if (movimientosParaInsertar.length > 0) {
                const { error: errorMovimiento } = await supabase
                    .from('movimiento')
                    .insert(movimientosParaInsertar);
                if (errorMovimiento) throw new Error(`Producto guardado, pero falló el movimiento: ${errorMovimiento.message}`);
            }

            return { success: true };

        } catch (err) {
            setError(err.message);
            console.error("Error al agregar producto:", err);
            // --- 5. CORRECCIÓN DE ERROR ---
            // Tu componente busca 'result.message', no 'result.error'
            return { success: false, message: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const eliminarProducto = async (idProducto) => {
    };

    return {
        productos,
        isLoading,
        error,
        setProductos,
        agregarProducto,
        eliminarProducto
    };
}