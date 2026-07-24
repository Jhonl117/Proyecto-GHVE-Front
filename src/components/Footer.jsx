const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="h-12 bg-white border-t border-gray-100 flex items-center justify-center px-4">
      <p className="text-sm text-gray-500">
        Gestión Humana VE Productions ©{currentYear} Todos los derechos reservados.
      </p>
    </footer>
  );
};

export default Footer;
