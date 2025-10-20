import { Plus, Save } from 'lucide-react';
import NuevaCategoria from "../components/nuevaCategoria";
import { useCategorias } from '../hooks/useCategorias';
import { useEffect, useState } from 'react';
import { useUnidadesMedidas } from '../hooks/useUnidadesMedidas';
import { useProveedores } from '../hooks/useProveedores';
import { toast } from "react-hot-toast";
import { supabase } from '../supabase/supabaseclient';
import { useEmpresa } from '../contexts/empresacontext';

export default function NuevoProducto({ onClose, onProductoAgregado }) {
    const { categorias, agregarCategoria } = useCategorias();
    const { unidadesMedidas } = useUnidadesMedidas();
    const { proveedores } = useProveedores();
    const { empresaId: empresaSeleccionada } = useEmpresa();
    const [listaCategorias, setListaCategorias] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoriaId, setCategoriaId] = useState('');
    const [unidadMedidaId, setUnidadMedidaId] = useState(''); 
    const [proveedorId, setProveedorId] = useState('');

    useEffect(() => {
        setListaCategorias(categorias);
    }, [categorias]);

    const handleSaveCategoria = async (nuevaCat) => {
        const result = await agregarCategoria(nuevaCat.nombre, nuevaCat.descripcion);
        if (result.success) {
            setListaCategorias((prev) => [...prev, result.data]);
            setIsModalOpen(false);
            toast.success("✅ Categoría agregada correctamente", {
                style: {
                    backgroundColor: "rgb(34, 197, 94, 0.9)",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "12px 16px",
                }
            });
        } else {
            toast.error(`⚠️ ${result.message || "Error al guardar categoría"}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.target;

        let codigoSku = "";
        const base = form["nombre"].value
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z]/g, "")
            .substring(0, 3);

        try {
            const { data, error } = await supabase
                .from("productos")
                .select("codigo_sku")
                .eq("id_empresa", empresaSeleccionada)
                .ilike("codigo_sku", `SKU-${base}-%`);

            if (error) throw error;

            const siguienteNumero = (data?.length || 0) + 1;
            const numeroFormateado = String(siguienteNumero).padStart(3, "0");
            codigoSku = `SKU-${base}-${numeroFormateado}`;
        } catch (err) {
            console.error("Error al generar SKU automático:", err);
            codigoSku = `SKU-${base}-001`; 
        }

        const nuevoProducto = {
            id_categoria: categoriaId || null,
            codigo_sku: codigoSku,
            nombre: form["nombre"].value.trim(),
            descripcion: form["descripcion"].value.trim(),
            precio_compra: parseFloat(form["costo-unitario"].value) || 0,
            precio_venta: parseFloat(form["precio-unitario"].value) || 0,
            stock: parseInt(form["cantidad-inicial"].value) || 0,
            stock_minimo: parseInt(form["stock-minimo"].value) || 0,
            id_unidad_medida: parseInt(unidadMedidaId) || null, 
            id_proveedor: parseInt(proveedorId) || null,
            fecha_vencimiento: form["fechavencimiento"].value || null,
            estado: true,
        };

        const result = await onProductoAgregado(nuevoProducto);

        if (result.success) {
            toast.success(`✅ Producto agregado correctamente (SKU: ${codigoSku})`);
            onClose();
        } else {
            toast.error(`⚠️ ${result.message || errorPr || "Error al agregar producto"}`);
        }
    };


    return (
        <>
            <div className="bg-[#0D0D0D] text-white p-8 rounded-2xl w-full max-w-4xl shadow-lg animate-fade-in border-1 border-secondary">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-semibold">Nuevo Producto</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="nombre" className="text-sm font-medium text-gray-300">Nombre</label>
                            <input id="nombre" type="text" placeholder="Nombre del producto" required className="bg-[#2A2A2A] border border-secondary rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="categoria" className="text-sm font-medium text-gray-300">Categoría</label>
                            <div className="flex flex-row gap-2 items-center">
                                <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="bg-[#2A2A2A] border border-secondary flex-1 rounded-lg p-3 appearance-none focus:ring-blue-500 focus:border-blue-500 transition">
                                    <option value="">Seleccione categoría</option>
                                    {listaCategorias.map(c => (
                                        <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setIsModalOpen(true)} className="bg-title text-primary flex items-center p-3 rounded-lg hover:bg-[#E8E8E8] transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer">
                                    <Plus />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="cantidad-inicial" className="text-sm font-medium text-gray-300">Cantidad Inicial</label>
                            <input id="cantidad-inicial" type="number" defaultValue="0" className="bg-[#2A2A2A] border border-secondary rounded-lg p-3" />
                        </div>

                        <div className="md:col-span-3 flex flex-col gap-2">
                            <label htmlFor="descripcion" className="text-sm font-medium text-gray-300">Descripción</label>
                            <input id="descripcion" type="text" placeholder="Descripción detallada" className="bg-[#2A2A2A] border border-secondary rounded-lg p-3" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="stock-minimo" className="text-sm font-medium text-gray-300">Stock Mínimo</label>
                            <input id="stock-minimo" type="number" defaultValue="0" className="bg-[#2A2A2A] border border-secondary rounded-lg p-3" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="costo-unitario" className="text-sm font-medium text-gray-300">Costo Unitario</label>
                            <input id="costo-unitario" type="number" step="0.01" defaultValue="0" className="bg-[#2A2A2A] border border-secondary rounded-lg p-3" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="precio-unitario" className="text-sm font-medium text-gray-300">Precio Unitario</label>
                            <input id="precio-unitario" type="number" step="0.01" defaultValue="0" className="bg-[#2A2A2A] border border-secondary rounded-lg p-3" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="unidadmedida" className="text-sm font-medium text-gray-300">Unidad de Medida</label>
                            <select id="unidadmedida" value={unidadMedidaId} onChange={(e) => setUnidadMedidaId(e.target.value)} className="bg-[#2A2A2A] border border-secondary rounded-lg p-3">
                                <option value="">Seleccione una unidad</option>
                                {unidadesMedidas.map(u => (
                                    <option key={u.id_unidad_medida} value={u.id_unidad_medida}>{u.nombre} ({u.abreviatura})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2"> 
                            <label htmlFor="proveedor" className="text-sm font-medium text-gray-300">
                                Proveedor
                            </label> 
                            <select id="proveedores" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="bg-[#2A2A2A] border border-secondary rounded-lg p-3 appearance-none focus:ring-blue-500 focus:border-blue-500 transition"> 
                                <option value="">
                                    Seleccione un proveedor
                                </option> 
                                {proveedores.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre_comercial}
                                    </option>)
                                )} 
                            </select> 
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="fechavencimiento" className="text-sm font-medium text-gray-300">Fecha de Vencimiento</label>
                            <input id="fechavencimiento" type="date" className="bg-[#2A2A2A] border border-secondary rounded-lg p-3 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="border border-secondary text-white py-2 px-6 rounded-lg hover:bg-secondary transition-transform hover:scale-110">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-white text-black py-2 px-4 rounded-lg hover:bg-[#E8E8E8] transition-transform hover:scale-110 flex items-center gap-2">
                            <Save />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>

            <NuevaCategoria isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCategoria} />
        </>
    );
}
