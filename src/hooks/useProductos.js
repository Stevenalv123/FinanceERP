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

    const agregarProducto = async (nuevoProducto) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!empresaId) throw new Error("No hay empresa seleccionada.");

            // FIX: Build the object for Supabase explicitly.
            const productoParaInsertar = {
                id_empresa: empresaId, // Add the required company ID
                codigo_sku: nuevoProducto.codigo_sku,
                nombre: nuevoProducto.nombre,
                descripcion: nuevoProducto.descripcion,
                id_categoria: nuevoProducto.id_categoria,
                precio_compra: nuevoProducto.precio_compra,
                precio_venta: nuevoProducto.precio_venta,
                stock: nuevoProducto.stock,
                stock_minimo: nuevoProducto.stock_minimo,
                id_unidad_medida: nuevoProducto.id_unidad_medida,
                id_proveedor: nuevoProducto.id_proveedor,
                fecha_vencimiento: nuevoProducto.fecha_vencimiento,
                estado: nuevoProducto.estado,
            };

            console.log("Enviando este objeto al hook:", nuevoProducto);

            const { data, error } = await supabase
                .from("productos")
                .insert(productoParaInsertar) // Now this object has the correct structure
                .select(`
                *,
                categorias_producto(nombre),
                unidades_medidas(nombre),
                proveedores(nombre_comercial)
            `)
                .single();

            if (error) throw error;

            setProductos((productosActuales) => [...productosActuales, data]);

            return { success: true };

        } catch (err) {
            setError(err.message);
            console.error("Error al agregar producto:", err);
            return { success: false, message: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const eliminarProducto = async (idProducto) => {
        try {
            const { error } = await supabase
                .from("productos")
                .delete()
                .eq("id_producto", idProducto);

            if (error) throw error;

            setProductos((productosActuales) =>
                productosActuales.filter((p) => p.id_producto !== idProducto)
            );

            return { success: true };

        } catch (err) {
            console.error("Error al eliminar producto:", err);
            return { success: false, message: err.message };
        }
    };

    return { productos, isLoading, error, setProductos, agregarProducto, eliminarProducto };
}
