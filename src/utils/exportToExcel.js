import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { calcularFlujoDeEfectivo } from './financialCalculations';

// --- Funciones de Estilo ---
const addTitle = (ws, title, subtitle) => {
    ws.addRow([title]).font = { size: 16, bold: true };
    ws.addRow([subtitle]);
    ws.addRow([]); // Espacio
    ws.mergeCells('A1:C1');
    ws.mergeCells('A2:C2');
};

const setHeaders = (ws, columns) => {
    const headerRow = ws.addRow(columns);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };
        cell.border = { bottom: { style: 'thin' } };
    });
};

const setNumberFormat = (ws, colLetter) => {
    ws.getColumn(colLetter).numFmt = '"C$" #,##0.00;[Red]"C$" -#,##0.00';
};

// --- 1. FUNCIÓN HELPER (AHORA GLOBAL) ---
const findAnterior = (cuentasAnt, cuentaNombre) => {
    // Añadimos una validación por si cuentasAnt es undefined
    if (!cuentasAnt) return 0;
    const cuenta = cuentasAnt.find(c => c.cuenta === cuentaNombre);
    return cuenta ? cuenta.saldo : 0;
};

// --- Función Principal de Exportación ---
export const exportFinancialReports = async (
    datosActuales,
    datosAnteriores,
    empresaInfo,
    fechaInicio,
    fechaCierre
) => {
    const wb = new ExcelJS.Workbook();
    wb.creator = "FinanceERP";
    wb.created = new Date();

    generateBalanceSheet(wb, datosActuales, datosAnteriores, empresaInfo, fechaCierre);
    generateEstadoResultadosSheet(wb, datosActuales, datosAnteriores, empresaInfo, fechaInicio, fechaCierre);
    generateFlujoEfectivoSheet(wb, datosActuales, datosAnteriores, empresaInfo, fechaInicio, fechaCierre);

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Reportes_Financieros_${empresaInfo.nombre}_${fechaCierre}.xlsx`);
};

// --- HOJA 1: BALANCE GENERAL ---
const generateBalanceSheet = (wb, datos, datosAnt, info, fecha) => {
    const ws = wb.addWorksheet('Balance General');
    addTitle(ws, 'Balance General', `Empresa: ${info.nombre} | Al ${fecha}`);
    setHeaders(ws, ['Cuenta', 'Actual', 'Anterior']);

    // --- 2. LA FUNCIÓN 'findAnterior' YA NO ESTÁ AQUÍ ---

    ws.addRow(['Activos']).font = { bold: true, size: 12 };
    Object.entries(datos.activosAgrupados).forEach(([subtipo, data]) => {
        ws.addRow([`  ${subtipo}`]).font = { bold: true };
        data.cuentas.forEach(c => {
            // 3. Esta llamada ahora usa la función global
            const saldoAnt = findAnterior(datosAnt.activosAgrupados[subtipo]?.cuentas, c.cuenta);
            ws.addRow([`    ${c.cuenta}`, c.saldo, saldoAnt]);
        });
    });
    ws.addRow(['TOTAL ACTIVOS', datos.totalActivos, datosAnt.totalActivos]).font = { bold: true, size: 12 };

    ws.addRow([]); // Espacio

    ws.addRow(['Pasivos y Patrimonio']).font = { bold: true, size: 12 };
    Object.entries(datos.pasivosAgrupados).forEach(([subtipo, data]) => {
        ws.addRow([`  ${subtipo}`]).font = { bold: true };
        data.cuentas.forEach(c => {
            const saldoAnt = findAnterior(datosAnt.pasivosAgrupados[subtipo]?.cuentas, c.cuenta);
            ws.addRow([`    ${c.cuenta}`, c.saldo * -1, saldoAnt * -1]);
        });
    });
    ws.addRow(['Total Pasivos', datos.totalPasivos, datosAnt.totalPasivos]).font = { bold: true };

    ws.addRow([`  Patrimonio`]).font = { bold: true };
    datos.patrimonio.forEach(c => {
        const saldoAnt = findAnterior(datosAnt.patrimonio, c.cuenta);
        ws.addRow([`    ${c.cuenta}`, c.saldo * -1, saldoAnt * -1]);
    });
    ws.addRow(['  Utilidad (o Pérdida) del Período', datos.utilidadNeta, datosAnt.utilidadNeta]).font = { bold: true };
    ws.addRow(['Total Patrimonio', datos.totalPatrimonioCuentas + datos.utilidadNeta, datosAnt.totalPatrimonioCuentas + datosAnt.utilidadNeta]).font = { bold: true };

    ws.addRow(['TOTAL PASIVO + PATRIMONIO', datos.totalPasivos + datos.totalPatrimonioCuentas + datos.utilidadNeta, datosAnt.totalPasivos + datosAnt.totalPatrimonioCuentas + datosAnt.utilidadNeta]).font = { bold: true, size: 12 };

    setNumberFormat(ws, 'B');
    setNumberFormat(ws, 'C');
    // --- 4. CORRECCIÓN DEL ANCHO DE COLUMNA ---
    ws.getColumn('A').width = 40;
    ws.getColumn('B').width = 20;
    ws.getColumn('C').width = 20;
};

// --- HOJA 2: ESTADO DE RESULTADOS ---
const generateEstadoResultadosSheet = (wb, datos, datosAnt, info, fechaInicio, fechaCierre) => {
    const ws = wb.addWorksheet('Estado de Resultados');
    addTitle(ws, 'Estado de Resultados', `Empresa: ${info.nombre} | Del ${fechaInicio} al ${fechaCierre}`);
    setHeaders(ws, ['Cuenta', 'Total Periodo']);

    const pVentas = datos.totalIngresos - datosAnt.totalIngresos;
    const pCostos = datos.totalCostos - datosAnt.totalCostos;
    const pGastos = datos.totalGastos - datosAnt.totalGastos;
    const pUtilidadBruta = (pVentas * -1) - pCostos;
    const pUtilidadNeta = pUtilidadBruta - pGastos;

    ws.addRow(['Ingresos']).font = { bold: true };
    (datos.ingresosAgrupados || []).forEach(c => {
        // 5. Esta llamada AHORA SÍ FUNCIONA
        const saldoAnt = findAnterior(datosAnt.ingresosAgrupados, c.cuenta);
        ws.addRow([`  ${c.cuenta}`, (c.saldo - saldoAnt) * -1]);
    });
    ws.addRow(['Total Ingresos', pVentas * -1]).font = { bold: true };

    ws.addRow(['Costos']).font = { bold: true };
    (datos.costosAgrupados || []).forEach(c => {
        const saldoAnt = findAnterior(datosAnt.costosAgrupados, c.cuenta);
        ws.addRow([`  ${c.cuenta}`, c.saldo - saldoAnt]);
    });
    ws.addRow(['Total Costos', pCostos]).font = { bold: true };

    ws.addRow(['UTILIDAD BRUTA', pUtilidadBruta]).font = { bold: true, size: 12 };

    ws.addRow(['Gastos Operativos']).font = { bold: true };
    Object.entries(datos.gastosAgrupados || {}).forEach(([subtipo, data]) => {
        ws.addRow([`  ${subtipo}`]).font = { bold: true };
        data.cuentas.forEach(c => {
            const saldoAnt = findAnterior(datosAnt.gastosAgrupados[subtipo]?.cuentas, c.cuenta);
            ws.addRow([`    ${c.cuenta}`, c.saldo - saldoAnt]);
        });
    });
    ws.addRow(['Total Gastos', pGastos]).font = { bold: true };

    ws.addRow(['UTILIDAD NETA', pUtilidadNeta]).font = { bold: true, size: 12 };

    setNumberFormat(ws, 'B');
    ws.getColumn('A').width = 40;
    ws.getColumn('B').width = 20;
};

// --- HOJA 3: FLUJO DE EFECTIVO ---
const generateFlujoEfectivoSheet = (wb, datos, datosAnt, info, fechaInicio, fechaCierre) => {
    const ws = wb.addWorksheet('Flujo de Efectivo');
    addTitle(ws, 'Flujo de Efectivo (Indirecto)', `Empresa: ${info.nombre} | Del ${fechaInicio} al ${fechaCierre}`);
    setHeaders(ws, ['Concepto', 'Monto']);

    const f = calcularFlujoDeEfectivo(datos, datosAnt);

    ws.addRow(['Actividades de Operación']).font = { bold: true };
    ws.addRow(['  Utilidad Neta del Período', f.utilidadNeta]);
    ws.addRow(['  Ajustes:']).font = { bold: true };
    ws.addRow(['    Gasto por Depreciación', f.gastoDepreciacion]);
    ws.addRow(['    Ajuste por Cuentas por Cobrar', -f.cambioClientes]);
    ws.addRow(['    Ajuste por Inventario', -f.cambioInventario]);
    ws.addRow(['    Ajuste por Cuentas por Pagar', f.cambioProveedores]);
    ws.addRow(['Efectivo de Actividades de Operación', f.f_operacion]).font = { bold: true };

    ws.addRow([]);
    ws.addRow(['Actividades de Inversión']).font = { bold: true };
    ws.addRow(['  Compra de Activos Fijos', f.f_inversion]);
    ws.addRow(['Efectivo de Actividades de Inversión', f.f_inversion]).font = { bold: true };

    ws.addRow([]);
    ws.addRow(['Actividades de Financiación']).font = { bold: true };
    ws.addRow(['  Aumento (Disminución) de Préstamos', f.cambioPrestamos]);
    ws.addRow(['  Aumento (Disminución) de Capital', f.cambioCapital]);
    ws.addRow(['Efectivo de Actividades de Financiación', f.f_financiacion]).font = { bold: true };

    ws.addRow([]);
    ws.addRow(['Flujo Neto de Efectivo del Período', f.flujoNetoTotal]).font = { bold: true, size: 12 };
    ws.addRow(['Saldo Inicial de Efectivo', f.cajaInicial]).font = { bold: true };
    ws.addRow(['Saldo Final de Efectivo (Calculado)', f.cajaInicial + f.flujoNetoTotal]).font = { bold: true };
    ws.addRow(['Saldo Final en Balance (Real)', f.cajaFinal]).font = { bold: true, color: { argb: 'FF0088FE' } };

    setNumberFormat(ws, 'B');
    ws.getColumn('A').width = 40;
    ws.getColumn('B').width = 20;
};