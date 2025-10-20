import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseclient";
import { useEmpresa } from "../contexts/empresacontext";

export function useProveedores() {
    const { empresaId } = useEmpresa();
    const [proveedores, setProveedores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProveedores = async () => {
            if (!empresaId) return;

            setIsLoading(true);
            setError(null);

            try {
                const { data: proveedoresData, error: proveedoresError } = await supabase
                    .from("proveedores")
                    .select(`
                        id_proveedor,
                        nombre_comercial,
                        razon_social,
                        email,
                        telefono,
                        direccion,
                        dias_de_pago,
                        limite_credito,
                        estado,
                        categoria:categorias_producto(nombre),
                        pais:pais(paisnombre),
                        ciudad:estado(estadonombre)
                    `)
                    .eq("id_empresa", empresaId);

                if (proveedoresError) throw proveedoresError;

                const proveedoresFormateados = proveedoresData.map(p => ({
                    id: p.id_proveedor,
                    nombre_comercial: p.nombre_comercial,
                    razon_social: p.razon_social,
                    categoria: p.categoria?.nombre || "",
                    email: p.email,
                    telefono: p.telefono,
                    direccion: p.direccion,
                    pais: p.pais?.paisnombre || "",
                    ciudad: p.ciudad?.estadonombre || "",
                    dias_de_pago: p.dias_de_pago,
                    limite_credito: p.limite_credito,
                    estado: p.estado === true || p.estado === 1 || p.estado === "1" || p.estado === "t" ? 1 : 0
                }));

                setProveedores(proveedoresFormateados);
            } catch (err) {
                console.error("Error al cargar proveedores:", err);
                setError(err.message || "Error desconocido");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProveedores();
    }, [empresaId]);

    const agregarProveedor = async ({
        nombre_comercial,
        razon_social,
        id_categoria,
        email,
        telefono,
        direccion,
        id_pais,
        id_ciudad,
        dias_de_pago,
        limite_credito,
        estado = 1
    }) => {
        if (!empresaId) return { success: false, message: "No hay empresa seleccionada." };

        try {
            const { data: existente, error: errorExistente } = await supabase
                .from("proveedores")
                .select("id_proveedor")
                .eq("id_empresa", empresaId)
                .or(`nombre_comercial.eq.${nombre_comercial},email.eq.${email}`)
                .maybeSingle();

            if (errorExistente) throw errorExistente;

            if (existente) {
                return { success: false, message: "Ya existe un proveedor con ese nombre o email." };
            }

            const { data, error: errorInsert } = await supabase
                .from("proveedores")
                .insert([{
                    id_empresa: empresaId,
                    nombre_comercial,
                    razon_social,
                    id_categoria,
                    email,
                    telefono,
                    direccion,
                    id_pais,
                    id_ciudad,
                    dias_de_pago,
                    limite_credito,
                    estado
                }])
                .select(`
                    id_proveedor,
                    nombre_comercial,
                    razon_social,
                    email,
                    telefono,
                    direccion,
                    dias_de_pago,
                    limite_credito,
                    estado,
                    categoria:categorias_producto(nombre),
                    pais:pais(paisnombre),
                    ciudad:estado(estadonombre)
                `);

            if (errorInsert) throw errorInsert;

            const nuevoProveedor = data[0];

            setProveedores(prev => [
                ...prev,
                {
                    id: nuevoProveedor.id_proveedor,
                    nombre_comercial: nuevoProveedor.nombre_comercial,
                    razon_social: nuevoProveedor.razon_social,
                    categoria: nuevoProveedor.categoria?.nombre || "",
                    email: nuevoProveedor.email,
                    telefono: nuevoProveedor.telefono,
                    direccion: nuevoProveedor.direccion,
                    pais: nuevoProveedor.pais?.paisnombre || "",
                    ciudad: nuevoProveedor.ciudad?.estadonombre || "",
                    dias_de_pago: nuevoProveedor.dias_de_pago,
                    limite_credito: nuevoProveedor.limite_credito,
                    estado: nuevoProveedor.estado
                }
            ]);

            return { success: true, data: nuevoProveedor };
        } catch (err) {
            console.error("Error al agregar proveedor:", err);
            return { success: false, message: err.message || "Error desconocido" };
        }
    };

    return { proveedores, isLoading, error, agregarProveedor };
}
