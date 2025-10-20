import { Building2, Plus, SquarePen, Trash } from "lucide-react"
import { useEffect } from "react"
import { useEmpresas } from "../hooks/useEmpresas"
import { useEmpresa } from "../contexts/empresacontext"

export default function Empresas() {
    const { empresas, isLoading } = useEmpresas();
    const { empresaId, setEmpresaId } = useEmpresa();

    const empresaSeleccionada = empresas.find(e=> e.id_empresa === empresaId)

    useEffect(() => {
        if (empresas.length > 0 && !empresaSeleccionada) {
            setEmpresaId(empresas[0].id_empresa)
        }
    }, [empresas, empresaId, setEmpresaId])

    return (
        <>
            <div className="flex flex-row justify-between mt-4">
                <div className="flex-col">
                    <h3 className="text-title text-2xl font-bold">Gestión de Empresas</h3>
                    <p className="text-subtitle">Administra las empresas y selecciona una para trabajar</p>
                </div>
                <button className="bg-title text-primary flex flex-row h-10 text-l gap-3 p-1 rounded-xl items-center hover:bg-[#E8E8E8] transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer">
                    <Plus />
                    Nueva empresa
                </button>
            </div>
            <div className="flex flex-col mt-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8">
                        <div className="w-10 h-10 border-4 border-title border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-title text-lg mt-4">Cargando...</p>
                    </div>
                ) : empresas.length === 0 ? (
                    <div className="flex flex-col items-center border-1 border-secondary rounded-xl gap-4 p-4">
                        <Building2 color="#FFFFFF" size={64} />
                        <h3 className="text-title text-xl">No hay empresas registradas</h3>
                        <p className="text-subtitle text-s">Crea tu primera empresa para empezar a gestionarla</p>
                        <button className="bg-title text-primary flex flex-row h-10 text-l gap-3 p-1 rounded-xl items-center hover:bg-[#E8E8E8] transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer">
                            <Plus />
                            Crear primera empresa
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {empresas.map((empresa) => {
                            const isSelected = empresaSeleccionada?.id_empresa === empresa.id_empresa;
                            return (
                                <div key={empresa.id_empresa} className={`flex flex-col gap-2 border border-secondary rounded-xl p-8 justify-between min-w-[80%] cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 ${isSelected ? "border-title" : "border-secondary"}`} onClick={() => setEmpresaId(empresa.id_empresa)}>
                                    <div className="flex flex-row justify-between items-center">
                                        <h4 className="text-title text-xl font-semibold">
                                            {empresa.nombre}
                                        </h4>
                                        <div className="gap-4 flex flex-row">
                                            <button className="hover:bg-blue-800 cursor-pointer rounded-4xl p-2 transition-transform duration-200 ease-in-out hover:scale-110">
                                                <SquarePen color="white" size={18} />
                                            </button>
                                            <button className="hover:bg-[#96030C] cursor-pointer rounded-4xl p-2 transition-transform duration-200 ease-in-out hover:scale-110">
                                                <Trash color="white" size={18} />
                                            </button>
                                        </div>

                                    </div>
                                    <p className="text-subtitle text-sm">{empresa.descripcion}</p>
                                    {empresa.sector && (
                                        <div className="p-2 w-40 bg-secondary rounded-2xl flex flex-row justify-center mt-8">
                                            <h6 className="text-title text-xs font-bold">{empresa.sector.nombre_sector}</h6>
                                        </div>
                                    )}
                                    {empresa.moneda && (
                                        <div className="flex flex-row justify-between items-center">
                                            <p className="text-subtitle text-s">
                                                Moneda: {empresa.moneda.simbolo}
                                            </p>
                                            <div className="p-2 rounded-2xl bg-title flex flex-row items-center justify-center">
                                                <p className="text-primary text-xs">Seleccionada</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )
                }
            </div>
        </>
    )
}