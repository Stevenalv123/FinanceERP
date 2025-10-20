import StatsCards from "../components/statscards";
import Tabs from "../components/tabs";
import NuevoProducto from "../components/nuevoProducto";
import { useState } from "react";
import { Box, TrendingUp, TrendingDown, CircleAlert, ArrowLeftRight, Plus, ShoppingBasket, Pencil, Trash } from "lucide-react";
import { useProductos } from "../hooks/useProductos";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

export default function Inventario() {
    const tabs = [
        { key: "productos", label: "Productos", icon: <ShoppingBasket size={16} /> },
        { key: "movimientos", label: "Movimientos", icon: <ArrowLeftRight size={16} /> }
    ];

    const [activeTab, setActiveTab] = useState("productos");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { productos, isLoading, eliminarProducto, agregarProducto } = useProductos();

    const valorTotalInventario = productos.reduce((total, producto) => {
        return total + (producto.stock * producto.precio_compra);
    }, 0);

    const handleEliminarProducto = async (id, nombre) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Esta acción no se puede revertir. Se eliminará el producto "${nombre}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#262626',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
            background: '#090909',
            color: '#fff',
            customClass: {
                popup: 'border border-secondary rounded-2xl'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { success, message } = await eliminarProducto(id);

                if (success) {
                    toast.success('✅ Producto eliminado correctamente');
                } else {
                    toast.error(`⚠️ Error al eliminar: ${message}`);
                }
            }
        });
    };

    return (
        <div>
            <div className="flex flex-row gap-4 justify-between mt-6">
                <StatsCards title={"Total Productos"} icon={<Box color="white" />} value={productos.length} />
                <StatsCards title={"Valor Inventario"} icon={<TrendingUp color="white" />} value={`C$${valorTotalInventario.toFixed(2)}`} />
                <StatsCards title={"Stock Bajo"} icon={<CircleAlert color="red" />} value={productos.filter(p => p.stock <= p.stock_minimo).length} />
                <StatsCards title={"Movimientos hoy"} icon={<TrendingDown color="white" />} value={"0"} />
            </div>

            <div className="mt-6">
                <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} width="16%" />
                <div className="mt-8 border border-secondary rounded-2xl p-5">
                    {activeTab === "productos" && (
                        <>
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-title text-xl font-bold">Gestión de productos</h3>
                                    <p className="text-subtitle text-s">Administra el catálogo de productos del inventario</p>
                                </div>
                                <button className="bg-title text-primary flex flex-row h-10 text-s gap-3 p-2 rounded-xl items-center cursor-pointer hover:bg-[#E8E8E8] hover:scale-110 transition" onClick={() => setIsModalOpen(true)}>
                                    <Plus /> Nuevo Producto
                                </button>
                            </div>

                            <div className="mt-8 overflow-x-auto">
                                {isLoading ? (
                                    <p className="p-4 text-center text-gray-400">Cargando productos...</p>
                                ) : productos.length === 0 ? (
                                    <p className="p-4 text-center text-gray-400">No hay productos registrados. ¡Agrega uno nuevo!</p>
                                ) : (
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-hidden rounded-lg border border-secondary mb-8">
                                            <table className="min-w-full border-collapse text-title">
                                                <thead className="bg-secondary/10">
                                                    <tr className="border-b border-secondary/50 text-sm font-semibold text-subtitle">
                                                        <th className="py-3 px-4 text-center">Código</th>
                                                        <th className="py-3 px-4 text-center">Nombre</th>
                                                        <th className="py-3 px-4 text-center">Categoría</th>
                                                        <th className="py-3 px-4 text-center">Precio Compra</th>
                                                        <th className="py-3 px-4 text-center">Precio Venta</th>
                                                        <th className="py-3 px-4 text-center">Stock</th>
                                                        <th className="py-3 px-4 text-center">Unidad</th>
                                                        <th className="py-3 px-4 text-center">Proveedor</th>
                                                        <th className="py-3 px-4 text-center">Fecha Registro</th>
                                                        <th className="py-3 px-4 text-center">Fecha de Vencimiento</th>
                                                        <th className="py-3 px-4 text-center">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productos.map((p) => (
                                                        <tr key={p.id_producto} className="border-t border-secondary/30 text-sm hover:bg-secondary/10 transition-colors">
                                                            <td className="py-3 px-4 font-mono text-center text-gray-400">{p.codigo_sku || "-"}</td>
                                                            <td className="py-3 px-4 font-medium text-center text-white">{p.nombre}</td>
                                                            <td className="py-3 px-4 text-center text-subtitle">{p.categorias_producto?.nombre || "N/A"}</td>
                                                            <td className="py-3 px-4 text-center text-subtitle">C${p.precio_compra.toFixed(2)}</td>
                                                            <td className="py-3 px-4 text-center text-subtitle">C${p.precio_venta.toFixed(2)}</td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock > p.stock_minimo
                                                                        ? 'bg-green-600/20 text-green-400'
                                                                        : 'bg-red-600/20 text-red-400'
                                                                    }`}>
                                                                    {p.stock}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-center text-subtitle">{p.unidades_medidas?.nombre || "N/A"}</td>
                                                            <td className="py-3 px-4 text-center text-subtitle">{p.proveedores?.nombre_comercial || "N/A"}</td>
                                                            <td className="py-3 px-4 text-center text-subtitle">{new Date(p.fecha_registro).toLocaleDateString()}</td>
                                                            <td className="py-3 px-4 text-center text-subtitle">{p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : "N/A"}</td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex justify-center gap-8">
                                                                    <button title="Editar Producto" className="text-blue-400 hover:text-blue-300 transition-colors transform hover:scale-110 cursor-pointer">
                                                                        <Pencil size={18}/>
                                                                    </button>
                                                                    <button title="Eliminar Producto" className="text-red-500 hover:text-red-400 transition-colors transform hover:scale-110 cursor-pointer" onClick={() => handleEliminarProducto(p.id_producto, p.nombre)}>
                                                                        <Trash size={18}/>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative z-10 mx-4">
                        <NuevoProducto onClose={() => setIsModalOpen(false)} 
                                       onProductoAgregado={agregarProducto}/>
                    </div>
                </div>
            )}
        </div>
    );
}
