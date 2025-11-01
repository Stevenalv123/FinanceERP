import {CircleCheck, Pencil, Trash} from "lucide-react"

export default function EmpleadosCards({ nombre_completo, identificacion, email, telefono, salario_mensual }) {
    return (
        <div className="flex flex-row border border-secondary rounded-lg p-4 justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col">
                <div className="flex flex-row gap-2 items-center mb-1">
                    <h4 className="font-semibold text-title text-lg">{nombre_completo}</h4>
                    <div>
                        <span className="text-button bg-button text-xs rounded-[20px] py-2 px-3">Activo</span>
                    </div>
                </div>
                <p className="text-sm text-subtitle mb-1">{identificacion} | {email} | {telefono}</p>
                <p><span>Salario: </span>$ {salario_mensual}</p>
            </div>
            <div className="flex flex-row gap-3 items-center">
                <button className="border border-secondary text-title p-2 rounded-[10px] text-xs cursor-pointer hover:scale-110 transition">Dar de baja</button>
                <button className="border border-secondary text-title p-2 rounded-[10px] text-xs cursor-pointer hover:scale-110 transition">Pagar Salario</button>
                <button className="border border-secondary text-title p-2 rounded-[10px] text-xs cursor-pointer hover:scale-110 transition"><Pencil /></button>
                <button className="border border-secondary text-title p-2 rounded-[10px] text-xs cursor-pointer hover:scale-110 transition"><Trash /></button>
            </div>
        </div>
    );
}