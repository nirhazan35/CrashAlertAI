import jwt_decode from 'jwt-decode';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: null,
  });

  const login = (token) => {
    const decoded = jwt_decode(token);
    setUser({
      isLoggedIn: true,
      role: decoded.role, // Set role based on the token
    });
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
