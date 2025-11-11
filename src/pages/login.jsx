import { useState } from "react";
import {useNavigate} from "react-router-dom"
import {useAuth} from "../contexts/authcontext"
import {toast} from "react-hot-toast"

export default function Login() {
    const [activeTab, setActiveTab] = useState("login");
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    }

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);

    const { session, signUpNewUser, loginUser } = useAuth();
    const navigate = useNavigate();
    console.log(session);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await signUpNewUser(email, password, fullName);
            if (result.success) {
                toast.success(`¡Registro exitoso! Bienvenido ${result.data.user.user_metadata.fullName} 🎉`, {
                    style: {
                        backgroundColor: "rgb(34, 197, 94, 0.9)",
                        color: "#fff",
                        borderRadius: "12px",   
                        padding: "12px 16px",
                    }
                });
                navigate("/dashboard");
            }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await loginUser(email, password);
            if (result.success) {
                toast.success(`!Bienvenido ${result.data.user.user_metadata.fullName}, a FinanceERP! 🎉`, {
                    style: {
                        backgroundColor: "rgb(34, 197, 94, 0.9)",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "12px 16px",
                    }
                });
                navigate("/dashboard");
            } else{
                if(result.error?.includes("Invalid login credentials")){
                    setError({field: "password", message: "Contraseña incorrecta" });
                } 
                else if (result.error?.includes("Email not found")) {
                    setError({ field: "email", message: "Este correo no está registrado" });
                } else {
                    setError({ field: "general", message: result.error });
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
            <div className="flex flex-col gap-2 items-center h-48 justify-center">
                <img src="LogoFinanceERP.png" alt="Logo Finance ERP" className="h-18 "/>
                <h1 className="text-title text-3xl font-bold">FinanceERP</h1>
                <p className="text-subtitle">Sistema de Gestión Financiera Empresarial</p>
            </div>
            <div className="bg-primary p-8 rounded-xl shadow-lg max-w-md w-full">
                <div className="flex flex-col gap-1">
                    <h1 className="text-title text-l font-bold text-start">
                        Acceso al sistema
                    </h1>
                    <p className="text-subtitle text-sm text-start mb-6">
                        Ingresa tu cuenta o registrate para comenzar
                    </p>
                </div>
                
                <div className="flex flex-row gap-1 bg-secondary rounded-xl p-1">
                    <button className={`w-full rounded-xl p-1 font-medium text-sm cursor-pointer transition-colors duration-300 ${activeTab === "login" ? "text-title bg-black" : "text-subtitle"}`} onClick={()=>handleTabChange("login")}>
                        Iniciar Sesión
                    </button>
                    <button className={`w-full rounded-xl p-2 font-medium text-sm cursor-pointer transition-colors duration-300 ${activeTab === "registrarse" ? "text-title bg-black" : "text-subtitle"}`} onClick={()=>handleTabChange("registrarse")}>
                        Registrarse
                    </button>
                </div>

                {activeTab == "login" ? (
                    <form className="space-y-4 mb-4 mt-4 flex flex-col gap-2" onSubmit={handleLogin}>
                        <div className="flex flex-col gap-1">
                            <label className="text-title text-sm font-bold text-start">Correo Electrónico</label>
                            <input type="email" required placeholder="admin@empresa.com" className="w-full bg-input text-title py-2 px-4 rounded-xl font-medium placeholder:text-subtitle border border-secondary" onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-title text-sm font-bold text-start">Contraseña</label>
                            <input type="password" required placeholder="••••••••" className="w-full bg-input text-title py-2 px-4 rounded-xl font-medium placeholder:text-subtitle border border-secondary" onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <button className="w-full bg-white text-black cursor-pointer py-2 px-4 rounded-xl font-medium">
                            Iniciar Sesión
                        </button>
                    </form>
                ) : (
                    <form className="space-y-4 mb-4 mt-4 flex flex-col gap-2" onSubmit={handleSignUp}>
                        <div className="flex flex-col gap-1">
                            <label className="text-title text-sm font-bold text-start">Nombre de Usuario</label>
                            <input type="text" required placeholder="Juan Pérez" className="w-full bg-input text-title py-2 px-4 rounded-xl font-medium placeholder:text-subtitle" onChange={(e) => setFullName(e.target.value)}/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-title text-sm font-bold text-start">Correo Electrónico</label>
                            <input type="email" required placeholder="admin@empresa.com" className="w-full bg-input text-title py-2 px-4 rounded-xl font-medium placeholder:text-subtitle" onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-title text-sm font-bold text-start">Contraseña</label>
                            <input type="password" required placeholder="••••••••" className="w-full bg-input text-title py-2 px-4 rounded-xl font-medium placeholder:text-subtitle" onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <button className="w-full cursor-pointer bg-white text-black py-2 px-4 rounded-xl font-medium">
                            Registrarse
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}