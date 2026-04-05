import React from "react";
import { FlowValidationContext } from "../context/FlowValidationContext";

export default function useFlowValidation() {
    const context = React.useContext(FlowValidationContext);
    if (!context) {
        throw new Error("useFlowValidation must be used within a FlowValidationContextProvider");
    }
    return context;
}