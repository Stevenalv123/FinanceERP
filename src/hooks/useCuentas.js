import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase/supabaseclient";
import { useEmpresa } from "../contexts/empresacontext";
import { toast } from "react-hot-toast";

export function useCuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [subtipos, setSubtipos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { empresaId } = useEmpresa();

  const fetchCuentas = useCallback(async () => {
    if (!empresaId) return;

    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('balance_general_view')
        .select('*')
        .eq('id_empresa', empresaId);

      if (error) throw error;

      setCuentas(data || []); 

    } catch (err) {
      console.error("Error cargando balance de cuentas:", err.message);
      setError(err.message);
      toast.error("No se pudo cargar el balance de cuentas");
    } finally {
      setIsLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const { data: tiposData, error: tiposError } = await supabase
          .from('tipo_cuenta')
          .select('*')
          .order('nombre', { ascending: true });

        if (tiposError) throw tiposError;
        setTipos(tiposData || []);

        const { data: subtiposData, error: subtiposError } = await supabase
          .from('subtipo_cuenta')
          .select('*')
          .order('nombre', { ascending: true });

        if (subtiposError) throw subtiposError;
        setSubtipos(subtiposData || []);

      } catch (err) {
        console.error("Error cargando catálogos de cuentas:", err.message);
        toast.error("Error al cargar catálogos de cuentas");
      }
    };

    fetchCatalogos();
  }, []); 

  useEffect(() => {
    fetchCuentas();
  }, [fetchCuentas]); 

  const crearCuenta = async (cuentaData) => {
    if (!empresaId) {
      toast.error("No hay una empresa seleccionada");
      return null;
    }

    if (!cuentaData.nombre || !cuentaData.id_tipo) {
      toast.error("El nombre y el tipo de cuenta son obligatorios");
      return null;
    }

    setIsLoading(true); 
    setError(null);

    try {
      const { data, error } = await supabase
        .from('cuentas_empresa') 
        .insert({
          id_empresa: empresaId,
          nombre: cuentaData.nombre,
          id_tipo: cuentaData.id_tipo,
          codigo: cuentaData.codigo || null,
          id_subtipo: cuentaData.id_subtipo || null,
          estado: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("✅ Cuenta creada exitosamente");

      await fetchCuentas(); 

      return data;

    } catch (err) {
      console.error("Error creando cuenta:", err.message);
      if (err.message.includes('cuentas_empresa_id_empresa_nombre_key')) {
        toast.error("⚠️ Ya existe una cuenta con ese nombre");
      } else {
        toast.error("Error al crear la cuenta");
      }
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cuentas,    
    tipos,      
    subtipos,   
    isLoading,
    error,
    crearCuenta,
    fetchCuentas
  };
}
