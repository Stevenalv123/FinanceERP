import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../supabase/supabaseclient";
import { useEmpresa } from "../contexts/empresacontext";

const TABLA = 'activos_fijos';

export function useActivosFijos() {
    const { empresaId } = useEmpresa();
    const [activosFijos, setActivosFijos] = useState([]);

    // Listas para los Dropdowns
    const [cuentasActivoFijo, setCuentasActivoFijo] = useState([]); // Para clasificar el activo (ej. Equipo de computo)
    const [cuentasGasto, setCuentasGasto] = useState([]); // Para la depreciación
    const [cuentasPago, setCuentasPago] = useState([]); // Para pagar (Caja/Banco)

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // 1. Cargar la lista de Activos Fijos registrados
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

    // 2. Cargar cuentas para catalogar el Activo (Busca por TEXTO, no por ID)
    const fetchCatalogos = useCallback(async () => {
        if (!empresaId) return;
        try {
            // A. Cuentas de Activo No Corriente (Para asignar al bien)
            const { data: dataActivos } = await supabase
                .from('cuentas_empresa')
                .select('*')
                .eq('id_empresa', empresaId)
                .eq('tipo', 'Activo')
                .eq('subtipo', 'Activo No Corriente')
                .order('nombre');
            setCuentasActivoFijo(dataActivos || []);

            // B. Cuentas de Gasto (Para configurar la depreciación futura)
            const { data: dataGastos } = await supabase
                .from('cuentas_empresa')
                .select('*')
                .eq('id_empresa', empresaId)
                .eq('tipo', 'Gasto')
                .order('nombre');
            setCuentasGasto(dataGastos || []);

            // C. Cuentas de Pago (Caja o Banco para pagar la compra)
            const { data: dataPago } = await supabase
                .from('cuentas_empresa')
                .select('*')
                .eq('id_empresa', empresaId)
                .eq('tipo', 'Activo')
                .in('nombre', ['Caja', 'Banco', 'Bancos', 'Caja General']) // Filtro por nombres comunes o subtipo Activo Corriente
                .order('nombre');
            setCuentasPago(dataPago || []);

        } catch (err) {
            console.error("Error al cargar catálogos:", err.message);
        }
    }, [empresaId]);

    useEffect(() => {
        fetchActivosFijos();
        fetchCatalogos();
    }, [fetchActivosFijos, fetchCatalogos]);


    // 3. Guardar Nuevo Activo
    const addActivoFijo = async (nuevoActivo) => {
        if (!empresaId) return { success: false, message: "No hay empresa seleccionada." };

        // Validación: El usuario debe seleccionar de dónde paga
        if (!nuevoActivo.id_cuenta_pago) {
            return { success: false, message: "Debes seleccionar la cuenta de pago (Caja o Banco)." };
        }

        setIsSaving(true);
        setError(null);

        try {
            // Preparamos el objeto para la tabla activos_fijos 
            // (Excluimos 'id_cuenta_pago' porque ese campo no existe en la tabla activos_fijos, solo se usa para el asiento)
            const { id_cuenta_pago, ...activoParaInsertar } = nuevoActivo;

            const activoData = {
                ...activoParaInsertar,
                id_empresa: empresaId
            };

            // A. Insertar en tabla 'activos_fijos'
            const { data, error } = await supabase
                .from(TABLA)
                .insert(activoData)
                .select()
                .single();

            if (error) throw error;

            // B. Crear Asiento Contable de Compra
            const movimientos = [
                {
                    // DEBE: Aumenta el Activo Fijo (ej. "Equipo de Transporte")
                    id_empresa: empresaId,
                    id_cuenta: nuevoActivo.id_cuenta_activo,
                    fecha: nuevoActivo.fecha_compra,
                    tipo: 'DEBE',
                    monto: Number(nuevoActivo.valor_compra),
                    descripcion: `Compra de activo fijo: ${nuevoActivo.nombre}`
                },
                {
                    // HABER: Disminuye el dinero (ej. "Banco" o "Caja")
                    id_empresa: empresaId,
                    id_cuenta: id_cuenta_pago, // <-- USAMOS EL ID SELECCIONADO POR EL USUARIO
                    fecha: nuevoActivo.fecha_compra,
                    tipo: 'HABER',
                    monto: Number(nuevoActivo.valor_compra),
                    descripcion: `Pago por compra de activo: ${nuevoActivo.nombre}`
                }
            ];

            const { error: errorMovimiento } = await supabase
                .from('movimiento')
                .insert(movimientos);

            if (errorMovimiento) {
                // Si falla el asiento, idealmente deberíamos borrar el activo creado (rollback manual), 
                // pero por ahora mostramos error.
                console.error("Error asiento:", errorMovimiento);
                toast.error("Activo guardado, pero falló el registro contable.");
            } else {
                toast.success("Activo y asiento contable registrados.");
            }

            await fetchActivosFijos();
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
        cuentasActivoFijo, // Para dropdown "Tipo de Activo"
        cuentasGasto,      // Para dropdown "Cuenta Depreciación"
        cuentasPago,       // Para dropdown "Pagar con..."
        isLoading,
        isSaving,
        error,
        addActivoFijo,
        fetchActivosFijos
    };
}