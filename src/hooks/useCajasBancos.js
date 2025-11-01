import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../supabase/supabaseclient"; 
import { useEmpresa } from "../contexts/empresacontext"; 

export function useCajasBancos() {
    const { empresaId } = useEmpresa(); 

    const [movimientos, setMovimientos] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    
    const [isSavingMov, setIsSavingMov] = useState(false);
    const [isDeletingMov, setIsDeletingMov] = useState(false);

    const fetchMovimientos = useCallback(async () => {
        if (!empresaId) return; 

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('movimiento')
                .select(`
                    id_movimiento,
                    fecha,
                    descripcion,
                    tipo,
                    monto,
                    fecha_registro,
                    cuentas_empresa ( nombre ) 
                `)
                .eq('id_empresa', empresaId)
                .order('fecha', { ascending: false })
                .order('fecha_registro', { ascending: false });

            if (error) {
                throw new Error("No se pudieron cargar los movimientos");
            }
            
            setMovimientos(data || []);
        } catch (error) {
            console.error(error.message);
            setMovimientos([]); 
        } finally {
            setIsLoading(false); 
        }
    }, [empresaId]); 
    useEffect(() => {
        fetchMovimientos();
    }, [fetchMovimientos]);

    const agregarMovimiento = async (movimiento) => {
        setIsSavingMov(true);
        console.log("Empresa ID en agregarMovimiento:", empresaId);
        if (!empresaId) {
            toast.error("Error: No se ha seleccionado una empresa.");
            setIsSavingMov(false);
            return null;
        }

        const { id_cuenta, monto, tipo, fecha, descripcion, referencia } = movimiento;
        const movimientoData = {
            id_cuenta,
            monto,
            tipo,
            fecha,
            descripcion,
            referencia
        };

        try {
            const { data, error } = await supabase
                .from('movimiento')
                .insert([{ id_empresa: empresaId, ...movimientoData }])
                .select()
                .single();

            if (error) throw error;
            
            await fetchMovimientos(); 
            
            setIsSavingMov(false);
            return data; 

        } catch (error) {
            console.error("Error al guardar movimiento:", error.message);
            setIsSavingMov(false);
            return null;
        }
    };

    const eliminarMovimiento = async (id_movimiento) => {
        setIsDeletingMov(true);
        try {
            const { error } = await supabase
                .from('movimiento')
                .delete()
                .eq('id_movimiento', id_movimiento);

            if (error) throw error;
            
            await fetchMovimientos(); 
            
            setIsDeletingMov(false);
            return { success: true };

        } catch (error) {
            console.error("Error al eliminar movimiento:", error.message);
            setIsDeletingMov(false);
            return { success: false, message: error.message };
        }
    };

    return { 
        movimientos, 
        isLoading,
        agregarMovimiento, 
        isSavingMov,
        eliminarMovimiento,
        isDeletingMov
    };
}