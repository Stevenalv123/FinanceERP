import { useState, useEffect, useCallback } from "react"; // <-- Importa useCallback
import { supabase } from "../supabase/supabaseclient";
import { useEmpresa } from "../contexts/empresacontext";

export function useVenta() {
  const [ventas, setVentas] = useState(undefined);
  const { empresaId } = useEmpresa();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVentas = useCallback(async () => {
    if (!empresaId) {
      setVentas([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("ventas")
        .select(
          "id_venta, numero_factura, id_cliente, fecha_venta, plazo_dias, monto_total, tipo_pago, estado"
        )
        .eq('id_empresa', empresaId)
        .order('fecha_venta', { ascending: false });

      if (error) throw error;
      setVentas(data);

    } catch (err) {
      console.error("Error cargando ventas:", err.message);
      setError(err.message);
      setVentas([]);
    } finally {
      setIsLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);


  const crearVenta = async ({
    id_cliente = null,
    tipo_pago = "Contado", 
    plazo_dias = null,
    referencia = null,
    detalle_items = [],
    numero_factura,
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!empresaId || detalle_items.length === 0 || !numero_factura) {
        throw new Error("Faltan datos obligatorios: empresa, items o número de factura.");
      }

      const { data, error: rpcError } = await supabase.rpc("fn_crear_nueva_venta", {
        p_id_empresa: empresaId,
        p_id_cliente: id_cliente,
        p_tipo_pago: tipo_pago,
        p_plazo_dias: plazo_dias,
        p_referencia: referencia,
        p_detalle_items: detalle_items,
        p_numero_factura: numero_factura,
      });

      if (rpcError) throw rpcError;

      fetchVentas();

      return data;

    } catch (err) {
      console.error("Error creando venta:", err.message);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { crearVenta, isLoading, error, ventas, fetchVentas };
}