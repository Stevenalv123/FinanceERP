import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../supabase/supabaseclient";
import { useEmpresa } from "../contexts/empresacontext";

const TABLA = 'activos_fijos';

export function useActivosFijos() {
    const { empresaId } = useEmpresa();
    const [activosFijos, setActivosFijos] = useState([]);
    const [cuentasActivo, setCuentasActivo] = useState([]);
    const [cuentasGasto, setCuentasGasto] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchActivosFijos = useCallback(async () => {
        if (!empresaId) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from(TABLA)
                .select(`
                    *, 
                    cuentas_empresa:id_cuenta_activo ( nombre, codigo )
                `)
                .eq('id_empresa', empresaId)
                .order('nombre', { ascending: true });

            if (error) throw error;
            setActivosFijos(data || []);
        } catch (err) {
            console.error("Error al cargar activos fijos:", err.message);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [empresaId]);

    const fetchCuentasDeActivo = useCallback(async () => {
        if (!empresaId) return;
        try {
            const { data, error } = await supabase
                .from('cuentas_empresa')
                .select('*')
                .eq('id_empresa', empresaId)
                .eq('id_tipo', 1)
                .eq('id_subtipo', 2);
            if (error) throw error;
            setCuentasActivo(data || []);
        } catch (err) {
            console.error("Error al cargar cuentas de activo:", err.message);
        }
    }, [empresaId]);

    const fetchCuentasDeGasto = useCallback(async () => {
        if (!empresaId) return;
        try {
            const { data, error } = await supabase
                .from('cuentas_empresa')
                .select('*')
                .eq('id_empresa', empresaId)
                // 
                // NOTA: Asumo que el tipo Gasto es 6. 
                // ¡Verifica este ID en tu tabla 'tipos_cuenta'!
                //
                .eq('id_tipo', 5) // <-- VERIFICA ESTE ID
                .order('nombre', { ascending: true });

            if (error) throw error;
            setCuentasGasto(data || []);
        } catch (err) {
            console.error("Error al cargar cuentas de gasto:", err.message);
        }
    }, [empresaId]);

    useEffect(() => {
        fetchActivosFijos();
        fetchCuentasDeActivo();
        fetchCuentasDeGasto();
    }, [fetchActivosFijos, fetchCuentasDeActivo, fetchCuentasDeGasto]);


    const addActivoFijo = async (nuevoActivo) => {
        if (!empresaId) {
            return { success: false, message: "No hay empresa seleccionada." };
        }

        setIsSaving(true);
        setError(null);
        const ID_CUENTA_PAGO = 8;

        try {
            const activoParaInsertar = {
                ...nuevoActivo,
                id_empresa: empresaId
            };

            const { data, error } = await supabase
                .from(TABLA)
                .insert(activoParaInsertar)
                .select()
                .single();

            if (error) throw error;

            // --- Lógica Contable de Partida Doble ---
            const movimientos = [
                {
                    id_empresa: empresaId,
                    id_cuenta: nuevoActivo.id_cuenta_activo,
                    fecha: nuevoActivo.fecha_compra,
                    tipo: 'DEBE',
                    monto: nuevoActivo.valor_compra,
                    descripcion: `Compra de activo: ${nuevoActivo.nombre}`
                },
                {
                    id_empresa: empresaId,
                    id_cuenta: ID_CUENTA_PAGO,
                    fecha: nuevoActivo.fecha_compra,
                    tipo: 'HABER',
                    monto: nuevoActivo.valor_compra,
                    descripcion: `Pago por activo: ${nuevoActivo.nombre}`
                }
            ];

            const { error: errorMovimiento } = await supabase
                .from('movimiento')
                .insert(movimientos);

            if (errorMovimiento) {
                toast.error("Activo guardado, pero falló el asiento contable.");
            }

            await fetchActivosFijos();
            // Devolvemos el 'data' del activo creado, no el de los movimientos
            return { success: true, data: data };

        } catch (err) {
            console.error("Error al agregar activo fijo:", err.message);
            return { success: false, message: err.message }; 
        } finally {
            setIsSaving(false);
        }
    };

    return {
        activosFijos,
        cuentasActivo,
        cuentasGasto,
        isLoading,
        isSaving,
        error,
        addActivoFijo,
        fetchActivosFijos
    };
}