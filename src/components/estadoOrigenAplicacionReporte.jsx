import React, { useMemo } from 'react';

export default function EstadoOrigenAplicacionReporte({ isLoading, datosActuales, datosAnteriores }) {

    const reporte = useMemo(() => {
        if (!datosActuales || !datosAnteriores) return { lineas: [], totalOrigen: 0, totalAplicacion: 0 };

        const lineas = [];
        let totalOrigen = 0;
        let totalAplicacion = 0;

        // 1. EXTRAER TODAS LAS CUENTAS ÚNICAS DE AMBOS PERIODOS
        // Creamos un mapa donde la clave es el ID y el valor es la info básica (nombre, tipo)
        const mapaCuentas = new Map();

        const extraerCuentas = (datos, origen) => {
            // Activos y Pasivos (Agrupados)
            [datos.activosAgrupados, datos.pasivosAgrupados].forEach(grupo => {
                Object.values(grupo || {}).forEach(subgrupo => {
                    subgrupo.cuentas.forEach(c => {
                        if (!mapaCuentas.has(c.id_cuenta)) {
                            mapaCuentas.set(c.id_cuenta, { 
                                nombre: c.cuenta, 
                                tipo: c.tipo, // 'Activo' o 'Pasivo'
                                saldoActual: 0, 
                                saldoAnterior: 0 
                            });
                        }
                        // Asignar saldo según de dónde viene
                        const registro = mapaCuentas.get(c.id_cuenta);
                        if (origen === 'actual') registro.saldoActual = c.saldo;
                        else registro.saldoAnterior = c.saldo;
                    });
                });
            });

            // Patrimonio (Array plano)
            (datos.patrimonio || []).forEach(c => {
                if (!mapaCuentas.has(c.id_cuenta)) {
                    mapaCuentas.set(c.id_cuenta, { 
                        nombre: c.cuenta, 
                        tipo: 'Patrimonio',
                        saldoActual: 0, 
                        saldoAnterior: 0 
                    });
                }
                const registro = mapaCuentas.get(c.id_cuenta);
                if (origen === 'actual') registro.saldoActual = c.saldo;
                else registro.saldoAnterior = c.saldo;
            });
        };

        extraerCuentas(datosActuales, 'actual');
        extraerCuentas(datosAnteriores, 'anterior');

        // 2. PROCESAR CADA CUENTA UNIFICADA
        mapaCuentas.forEach((datosCuenta) => {
            const { nombre, tipo, saldoActual, saldoAnterior } = datosCuenta;

            // Normalizar saldos a positivo para la lógica de variación
            const saldoActAbs = tipo !== 'Activo' ? Math.abs(saldoActual) : saldoActual;
            const saldoAntAbs = tipo !== 'Activo' ? Math.abs(saldoAnterior) : saldoAnterior;

            const variacion = saldoActAbs - saldoAntAbs;

            // Si no hubo cambio, saltar
            if (Math.abs(variacion) < 0.01) return;

            let esOrigen = false;
            let esAplicacion = false;

            // LÓGICA FINANCIERA
            if (tipo === 'Activo') {
                // Caso especial: Depreciación Acumulada (Contra-Activo)
                // Se comporta como Pasivo (Aumento = Origen)
                if (nombre.toLowerCase().includes('depreciacion') || nombre.toLowerCase().includes('depreciación')) {
                     if (variacion > 0) esOrigen = true; // Aumentó (se hizo más negativa) -> Origen
                     else esAplicacion = true;
                } else {
                    // Activo Normal
                    if (variacion > 0) esAplicacion = true; // Aumento -> Aplicación
                    else esOrigen = true; // Disminución -> Origen
                }
            } else {
                // Pasivo y Patrimonio
                if (variacion > 0) esOrigen = true; // Aumento -> Origen
                else esAplicacion = true; // Disminución -> Aplicación
            }

            const monto = Math.abs(variacion);

            if (esOrigen) totalOrigen += monto;
            if (esAplicacion) totalAplicacion += monto;

            lineas.push({
                cuenta: nombre,
                variacion: variacion,
                origen: esOrigen ? monto : 0,
                aplicacion: esAplicacion ? monto : 0
            });
        });

        // 3. AGREGAR UTILIDAD/PÉRDIDA DEL PERIODO (Calculada)
        const utilidadActual = datosActuales.utilidadNeta || 0;
        const utilidadAnterior = datosAnteriores.utilidadNeta || 0;
        const varUtilidad = utilidadActual - utilidadAnterior;

        if (Math.abs(varUtilidad) > 0.01) {
            // La utilidad aumenta el patrimonio -> Origen
            // La pérdida disminuye el patrimonio -> Aplicación
            // (Nota: Si varUtilidad es negativa, es una disminución de patrimonio)
            const esOrigenUtil = varUtilidad > 0;
            const montoUtil = Math.abs(varUtilidad);
            
            if (esOrigenUtil) totalOrigen += montoUtil;
            else totalAplicacion += montoUtil;

            lineas.push({
                cuenta: "Utilidad (o Pérdida) del Período",
                variacion: varUtilidad,
                origen: esOrigenUtil ? montoUtil : 0,
                aplicacion: !esOrigenUtil ? montoUtil : 0
            });
        }

        return { lineas, totalOrigen, totalAplicacion };

    }, [datosActuales, datosAnteriores]);

    if (isLoading) return <p className="text-center py-8">Cargando...</p>;

    return (
        // ... (Tu JSX se queda exactamente igual que en la versión anterior) ...
        <div className="mt-4 rounded-xl border-1 border-secondary p-4 w-full overflow-x-auto">
             {/* ... (Copia el JSX de la respuesta anterior) ... */}
             <div className="min-w-[700px]">
                <h1 className="text-title font-semibold text-lg mb-4">Estado de Origen y Aplicación de Fondos</h1>
                {/* ... Tabla ... */}
                 <div className="grid grid-cols-4 font-bold text-right border-b border-secondary pb-2 mb-2 text-title">
                    <span className="text-left pl-2">Cuenta / Rubro</span>
                    <span>Variación Neta</span>
                    <span className="text-green-500">Orígenes (Fuentes)</span>
                    <span className="text-blue-500">Aplicaciones (Usos)</span>
                </div>

                <div className="flex flex-col gap-1">
                    {reporte.lineas.length === 0 ? (
                        <p className="text-center py-4 text-subtitle">No hay variaciones en este período.</p>
                    ) : (
                        reporte.lineas.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-4 text-right py-2 border-b border-secondary/10 hover:bg-secondary/5 transition-colors">
                                <span className="text-left pl-2 text-title font-medium truncate" title={item.cuenta}>{item.cuenta}</span>
                                <span className={`text-sm ${item.variacion >= 0 ? 'text-title' : 'text-red-400'}`}>
                                    C$ {item.variacion.toFixed(2)}
                                </span>
                                <span className={`text-sm ${item.origen ? 'text-green-600 font-bold bg-green-900/10 rounded px-1' : 'text-gray-600'}`}>
                                    {item.origen !== 0 ? `C$ ${item.origen.toFixed(2)}` : '-'}
                                </span>
                                <span className={`text-sm ${item.aplicacion ? 'text-blue-500 font-bold bg-blue-900/10 rounded px-1' : 'text-gray-600'}`}>
                                    {item.aplicacion !== 0 ? `C$ ${item.aplicacion.toFixed(2)}` : '-'}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <div className="grid grid-cols-4 text-right py-4 mt-4 border-t-2 border-secondary font-bold text-lg bg-secondary/5 rounded-b-lg">
                    <span className="col-span-2 text-left pl-4 text-title">TOTALES</span>
                    <span className="text-green-500">C$ {reporte.totalOrigen.toFixed(2)}</span>
                    <span className="text-blue-500">C$ {reporte.totalAplicacion.toFixed(2)}</span>
                </div>

                <div className="mt-4 text-center">
                    {Math.abs(reporte.totalOrigen - reporte.totalAplicacion) < 1 ? (
                        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-6 py-2 rounded-full border border-green-500/20 shadow-sm">
                            <span className="text-xl">⚖️</span>
                            <span className="font-semibold">Balanceado Correctamente</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-6 py-2 rounded-full border border-red-500/20 shadow-sm animate-pulse">
                            <span className="text-xl">⚠️</span>
                            <span className="font-semibold">Desbalanceado (Diferencia: C$ {(reporte.totalOrigen - reporte.totalAplicacion).toFixed(2)})</span>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
}