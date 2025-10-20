import {createContext, useContext, useState} from "react";

const EmpresaContext = createContext();

export const EmpresaProvider = ({ children }) => {
    const [empresaId, setEmpresaId] = useState(null);

    return (
        <EmpresaContext.Provider value={{ empresaId, setEmpresaId }}>
            {children}
        </EmpresaContext.Provider>
    );
}

export const useEmpresa = () => {
    return useContext(EmpresaContext);
}