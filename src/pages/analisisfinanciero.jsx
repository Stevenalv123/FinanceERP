import {
    CircleCheckBig,
    DollarSign,
    Percent,
    TrendingUp,
    Activity,
    AlertTriangle, // Ícono para valores negativos o de riesgo
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer, // Contenedor para hacer gráficos responsivos
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend, // Para el gráfico de barras
} from "recharts";

// --- 1. IMPORTA LOS HOOKS NECESARIOS ---
import { useMemo } from "react";
import { useCuentas } from "../hooks/useCuentas"; // Tu hook de datos

// --- 2. DEFINE LOS PARÁMETROS DE LA INDUSTRIA (Benchmarking) ---
// (Estos son ejemplos, deberías ajustarlos a tu sector industrial)
const INDUSTRY_AVERAGES = {
    liquidezCorriente: 2.0,
    endeudamiento: 40.0, // (en %)
    margenNeto: 12.0, // (en %)
    roe: 15.0, // (en %)
};

// --- 3. DATOS Y COLORES PARA GRÁFICOS ---
const PIE_COLORS = ["#0088FE", "#FF8042", "#00C49F"]; // Azul (Liquidez), Naranja (Endeudamiento), Verde (Rentabilidad)

export default function AnalisisFinanciero() {
    // --- 4. OBTIENE LOS DATOS DE LAS CUENTAS ---
    const { cuentas, isLoading } = useCuentas();

    // --- 5. BLOQUE DE CÁLCULO PARA TODOS LOS RATIOS E INTERPRETACIONES ---
    const {
        // Ratios
        liquidezCorriente,
        endeudamiento,
        margenNeto,
        roe,
        // Puntuaciones (0-100)
        liquidezScore,
        endeudamientoScore,
        rentabilidadScore,
        generalScore,
        // Interpretaciones
        liquidezStatus,
        liquidezInterpretation,
        endeudamientoStatus,
        endeudamientoInterpretation,
        rentabilidadStatus,
        rentabilidadInterpretation,
        generalStatus,
        // Datos para gráficos
        pieChartData,
        barChartData,
    } = useMemo(() => {
        // Filtros
        const activos = cuentas.filter((c) => c.tipo === "Activo");
        const pasivos = cuentas.filter((c) => c.tipo === "Pasivo");
        const patrimonioCuentas = cuentas.filter((c) => c.tipo === "Patrimonio");
        const ingresos = cuentas.filter((c) => c.tipo === "Ingreso");
        const costos = cuentas.filter((c) => c.tipo === "Costo");
        const gastos = cuentas.filter((c) => c.tipo === "Gasto");

        // Totales P&L
        const totalIngresos = ingresos.reduce((sum, c) => sum + c.saldo, 0);
        const totalCostos = costos.reduce((sum, c) => sum + c.saldo, 0);
        const totalGastos = gastos.reduce((sum, c) => sum + c.saldo, 0);
        const utilidadBruta = totalIngresos * -1 - totalCostos;
        const utilidadAntesImpuestos = utilidadBruta - totalGastos;
        const impuestoIR = utilidadAntesImpuestos > 0 ? utilidadAntesImpuestos * 0.3 : 0;
        const utilidadNeta = utilidadAntesImpuestos - impuestoIR;
        const totalVentas = totalIngresos * -1;

        // Totales Balance
        const totalActivos = activos.reduce((sum, c) => sum + c.saldo, 0);
        const totalPasivos = pasivos.reduce((sum, c) => sum + c.saldo, 0) * -1;
        const totalPatrimonioCuentas = patrimonioCuentas.reduce((sum, c) => sum + c.saldo, 0) * -1;
        const totalPatrimonio = totalPatrimonioCuentas + utilidadNeta;

        // Subtotales (¡Crucial!)
        const totalActivoCorriente = activos
            .filter((c) => c.subtipo === "Activo Corriente")
            .reduce((sum, c) => sum + c.saldo, 0);
        const totalPasivoCorriente =
            pasivos
                .filter((c) => c.subtipo === "Pasivo Corriente")
                .reduce((sum, c) => sum + c.saldo, 0) * -1;

        // --- Cálculo de Ratios ---
        const liquidezCorriente =
            totalPasivoCorriente > 0 ? totalActivoCorriente / totalPasivoCorriente : 0;
        const endeudamiento =
            totalActivos > 0 ? (totalPasivos / totalActivos) * 100 : 0;
        const margenNeto =
            totalVentas > 0 ? (utilidadNeta / totalVentas) * 100 : 0;
        const roe =
            totalPatrimonio > 0 ? (utilidadNeta / totalPatrimonio) * 100 : 0;

        // --- Lógica de Interpretación y Puntuación ---
        let liquidezScore = 0;
        let liquidezStatus = "Riesgo";
        let liquidezInterpretation = "Capacidad de pago a corto plazo en riesgo.";
        if (liquidezCorriente > 2.5) {
            liquidezScore = 95;
            liquidezStatus = "Excelente";
            liquidezInterpretation = "Sólida capacidad para cubrir obligaciones a corto plazo.";
        } else if (liquidezCorriente > 1.8) {
            liquidezScore = 80;
            liquidezStatus = "Saludable";
            liquidezInterpretation = "Buena capacidad para cubrir deudas a corto plazo.";
        } else if (liquidezCorriente > 1.0) {
            liquidezScore = 60;
            liquidezStatus = "Aceptable";
            liquidezInterpretation = "Cubre sus deudas a corto plazo, pero con poco margen.";
        }

        let endeudamientoScore = 0;
        let endeudamientoStatus = "Peligroso";
        let endeudamientoInterpretation = "La empresa depende en exceso de deuda externa.";
        if (endeudamiento < 30) {
            endeudamientoScore = 95;
            endeudamientoStatus = "Bajo";
            endeudamientoInterpretation = "Nivel de endeudamiento muy bajo y saludable.";
        } else if (endeudamiento < 50) {
            endeudamientoScore = 80;
            endeudamientoStatus = "Saludable";
            endeudamientoInterpretation = "Equilibrio saludable entre deuda y patrimonio.";
        } else if (endeudamiento < 70) {
            endeudamientoScore = 50;
            endeudamientoStatus = "Elevado";
            endeudamientoInterpretation = "La empresa tiene un nivel de deuda considerable.";
        }

        let rentabilidadScore = 0;
        let rentabilidadStatus = "Negativa";
        let rentabilidadInterpretation = "La empresa está perdiendo dinero.";
        if (roe > 20 || margenNeto > 15) {
            rentabilidadScore = 95;
            rentabilidadStatus = "Excelente";
            rentabilidadInterpretation = "Excelente rentabilidad. Alta generación de utilidades.";
        } else if (roe > 10 || margenNeto > 5) {
            rentabilidadScore = 75;
            rentabilidadStatus = "Buena";
            rentabilidadInterpretation = "La empresa genera buenas utilidades.";
        } else if (roe > 0) {
            rentabilidadScore = 60;
            rentabilidadStatus = "Positiva";
            rentabilidadInterpretation = "Rentabilidad positiva, pero con margen de mejora.";
        }

        const generalScore = (liquidezScore + endeudamientoScore + rentabilidadScore) / 3;
        let generalStatus = "Débil";
        if (generalScore > 85) generalStatus = "Excelente";
        else if (generalScore > 70) generalStatus = "Buena";
        else if (generalScore > 50) generalStatus = "Regular";

        // --- Datos para Gráficos ---
        const pieChartData = [
            { name: "Liquidez", value: liquidezScore },
            { name: "Endeudamiento", value: endeudamientoScore },
            { name: "Rentabilidad", value: rentabilidadScore },
        ];
        const barChartData = [
            {
                name: "Liquidez C.",
                "Tu Empresa": parseFloat(liquidezCorriente.toFixed(2)),
                Industria: INDUSTRY_AVERAGES.liquidezCorriente,
            },
            {
                name: "Endeudamiento",
                "Tu Empresa": parseFloat(endeudamiento.toFixed(1)),
                Industria: INDUSTRY_AVERAGES.endeudamiento,
            },
            {
                name: "Margen Neto",
                "Tu Empresa": parseFloat(margenNeto.toFixed(1)),
                Industria: INDUSTRY_AVERAGES.margenNeto,
            },
            {
                name: "ROE",
                "Tu Empresa": parseFloat(roe.toFixed(1)),
                Industria: INDUSTRY_AVERAGES.roe,
            },
        ];

        return {
            liquidezCorriente,
            endeudamiento,
            margenNeto,
            roe,
            liquidezScore,
            endeudamientoScore,
            rentabilidadScore,
            generalScore,
            liquidezStatus,
            liquidezInterpretation,
            endeudamientoStatus,
            endeudamientoInterpretation,
            rentabilidadStatus,
            rentabilidadInterpretation,
            generalStatus,
            pieChartData,
            barChartData,
        };
    }, [cuentas]); // Recalcula todo si las 'cuentas' cambian

    // Helper para mostrar ícono de status
    const StatusIcon = ({ score }) =>
        score > 50 ? (
            <CircleCheckBig className="inline mr-2 text-green-600" />
        ) : (
            <AlertTriangle className="inline mr-2 text-yellow-500" />
        );

    return (
        <div>
            {/* --- 6. INTEGRACIÓN EN EL JSX --- */}

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-1">Análisis Financiero</h1>
                <p className="text-subtitle">
                    Empresa: Agricorp | Análisis integral de ratios financieros
                </p>
            </div>

            <div className="p-6 border border-secondary rounded-xl bg-secondary/10">
                {/* ... Título ... */}
                <div>
                    <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                        <CircleCheckBig />
                        Diagnóstico Financiero General
                    </h2>
                    <p className="text-subtitle">
                        Evaluación integral de la salud financiera - Año 2025
                    </p>
                </div>

                <div className="flex flex-row justify-between mt-6">
                    <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                        Puntuación General:
                    </h2>
                    <div className="flex flex-row items-center gap-4">
                        <progress
                            className="w-32 h-1 rounded-full 
                                    bg-secondary/30
                                    [&::-webkit-progress-bar]:rounded-full 
                                    [&::-webkit-progress-bar]:bg-secondary/30
                                    [&::-webkit-progress-value]:rounded-full
                                    [&::-webkit-progress-value]:bg-white
                                    [&::-moz-progress-bar]:bg-white"
                            value={isLoading ? 0 : generalScore}
                            max="100"
                        ></progress>
                        <div className="text-right text-sm font-semibold rounded-2xl bg-title">
                            <span className="px-3 py-1 text-button bg-button rounded-2xl">
                                {isLoading ? "..." : generalStatus}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col md:flex-row space-between gap-4">
                    <div className="border border-secondary p-4 rounded-2xl w-full">
                        <div>
                            <StatusIcon score={liquidezScore} />
                            <span className="font-semibold text-title">Liquidez</span>
                        </div>
                        <p className="text-subtitle mt-2">
                            {isLoading ? "..." : liquidezInterpretation}
                        </p>
                        <progress
                            className="w-full h-1 mt-2
                                        rounded-full 
                                        bg-secondary/30
                                        [&::-webkit-progress-bar]:rounded-full 
                                        [&::-webkit-progress-bar]:bg-secondary/30
                                        [&::-webkit-progress-value]:rounded-full
                                      [&::-webkit-progress-value]:bg-white
                                      [&::-moz-progress-bar]:bg-white"
                            value={isLoading ? 0 : liquidezScore}
                            max="100"
                        ></progress>
                    </div>

                    <div className="border border-secondary p-4 rounded-2xl w-full">
                        <div>
                            <StatusIcon score={endeudamientoScore} />
                            <span className="font-semibold text-title">Endeudamiento</span>
                        </div>
                        <p className="text-subtitle mt-2">
                            {isLoading ? "..." : endeudamientoInterpretation}
                        </p>
                        <progress
                            className="w-full h-1 mt-2
                                    rounded-full 
                                    bg-secondary/30
                                    [&::-webkit-progress-bar]:rounded-full 
                                    [&::-webkit-progress-bar]:bg-secondary/30
                                    [&::-webkit-progress-value]:rounded-full
                                    [&::-webkit-progress-value]:bg-white
                                    [&::-moz-progress-bar]:bg-white"
                            value={isLoading ? 0 : endeudamientoScore}
                            max="100"
                        ></progress>
                    </div>

                    <div className="border border-secondary p-4 rounded-2xl w-full">
                        <div>
                            <StatusIcon score={rentabilidadScore} />
                            <span className="font-semibold text-title">Rentabilidad</span>
                        </div>
                        <p className="text-subtitle mt-2">
                            {isLoading ? "..." : rentabilidadInterpretation}
                        </p>
                        <progress
                            className="w-full h-1 mt-2
                                    rounded-full 
                                    bg-secondary/30
                                    [&::-webkit-progress-bar]:rounded-full 
                                    [&::-webkit-progress-bar]:bg-secondary/30
                                    [&::-webkit-progress-value]:rounded-full
                                    [&::-webkit-progress-value]:bg-white
                                    [&::-moz-progress-bar]:bg-white"
                            value={isLoading ? 0 : rentabilidadScore}
                            max="100"
                        ></progress>
                    </div>
                </div>
            </div>

            <div className="p-6 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-secondary p-4 rounded-2xl w-full">
                    <div>
                        <DollarSign className="inline mr-2 text-title" color="blue" />
                        <span className="font-semibold text-title">Liquidez Corriente</span>
                    </div>
                    <p className="text-title text-2xl font-semibold mt-6 ">
                        {isLoading ? "..." : liquidezCorriente.toFixed(2)}
                    </p>
                    <p className="text-subtitle mt-2">
                        {isLoading ? "..." : liquidezStatus}
                    </p>
                </div>

                <div className="border border-secondary p-4 rounded-2xl w-full">
                    <div>
                        <Percent className="inline mr-2 text-title" color="red" />
                        <span className="font-semibold text-title">Endeudamiento</span>
                    </div>
                    <p className="text-title text-2xl font-semibold mt-6 ">
                        {isLoading ? "..." : `${endeudamiento.toFixed(1)}%`}
                    </p>
                    <p className="text-subtitle mt-2">
                        {isLoading ? "..." : endeudamientoStatus}
                    </p>
                </div>

                <div className="border border-secondary p-4 rounded-2xl w-full">
                    <div>
                        <TrendingUp className="inline mr-2 text-title" color="green" />
                        <span className="font-semibold text-title">Margen Neto</span>
                    </div>
                    <p className="text-title text-2xl font-semibold mt-6 ">
                        {isLoading ? "..." : `${margenNeto.toFixed(1)}%`}
                    </p>
                    <p className="text-subtitle mt-2">
                        {isLoading ? "..." : rentabilidadStatus}
                    </p>
                </div>

                <div className="border border-secondary p-4 rounded-2xl w-full">
                    <div>
                        <Activity className="inline mr-2 text-title" color="purple" />
                        <span className="font-semibold text-title">ROE</span>
                    </div>
                    <p className="text-title text-2xl font-semibold mt-6 ">
                        {isLoading ? "..." : `${roe.toFixed(1)}%`}
                    </p>
                    <p className="text-subtitle mt-2">Retorno sobre Patrimonio</p>
                </div>
            </div>

            <div className="p-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="border border-secondary p-4 rounded-2xl w-full">
                    <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                        Evolución Histórica
                    </h2>
                    <p className="text-subtitle mb-6">
                        Ingresos, gastos y utilidades por año
                    </p>
                    {/* NOTA: Estos datos aún son estáticos. Necesitarías una RPC. */}
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={[
                                { year: "2023", income: 40000, expenses: 24000, profit: 16000 },
                                { year: "2024", income: 30000, expenses: 13980, profit: 16020 },
                                { year: "2025", income: 50000, expenses: 25000, profit: 25000 },
                            ]}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="income" name="Ingresos" stroke="#8884d8" />
                            <Line type="monotone" dataKey="expenses" name="Gastos" stroke="#82ca9d" />
                            <Line type="monotone" dataKey="profit" name="Utilidad" stroke="#ffc658" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="border border-secondary p-4 rounded-2xl w-full">
                    <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                        Puntuación de Salud Financiera
                    </h2>
                    <p className="text-subtitle mb-6">
                        Ponderación de los indicadores clave
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData} // DATOS DINÁMICOS
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                label
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="p-6 mt-6 border border-secondary rounded-xl bg-secondary/10">
                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    Comparación con Estándares de la Industria
                </h2>
                <p className="text-subtitle mb-6">
                    Benchmarking de ratios financieros (en %)
                </p>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}> {/* DATOS DINÁMICOS */}
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Tu Empresa" fill="#8884d8" />
                        <Bar dataKey="Industria" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}