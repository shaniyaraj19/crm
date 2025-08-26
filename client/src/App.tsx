import React from "react";
import Routes from "./Routes";
import { FieldsProvider } from "./contexts/FieldsContext";

const App: React.FC = () => {
  return (
    <FieldsProvider>
      <Routes />
    </FieldsProvider>
  );
};

export default App;