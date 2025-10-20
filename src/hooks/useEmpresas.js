import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseclient";
import { useAuth } from "../contexts/authcontext";

export function useEmpresas() {
  const { session } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchEmpresas = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("empresa")
        .select(`
          id_empresa,
          nombre,
          descripcion,
          sector:sector (nombre_sector),
          moneda:moneda (simbolo)
        `)
        .eq("id_user", session.user.id)
        .order("id_empresa", { ascending: false });

      if (error) {
        console.error("Error al cargar las empresas:", error);
      } else {
        setEmpresas(data || []);
      }

      setIsLoading(false);
    };

    fetchEmpresas();
  }, [session]);

  return { empresas, isLoading };
}

export function useCategorias(){

}
