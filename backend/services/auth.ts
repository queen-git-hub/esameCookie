import { createHmac } from "crypto";
import { User } from "../../api";
import { add, UserModel } from "./user";

// hash function
const hash = (password: string): string => {
  if (!process.env.SECURITY_SALT) {
    throw new Error("La variabile d'ambiente SECURITY_SALT non è definita.");
  }
  return createHmac("sha256", process.env.SECURITY_SALT)
    .update(password)
    .digest("hex");
};

// Login
export const login = async (email: string, password: string) => {
  // Trova l'utente per email
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return null;
  }

  const hashedPassword = hash(password);

  // Confronta la password fornita con quella memorizzata
  const isMatch = user.password === hashedPassword;
  if (!isMatch) {
    return null;
  }
  return user.toObject<User>();
};

// Add new user
export const register = async (data: Partial<User>) => {
  // Controllo se l'email esiste già
  const existingUser = await UserModel.findOne({ email: data.email });
  if (existingUser) {
    throw new Error(
      "Email già registrata. Non è possibile creare un altro utente con la stessa email.",
    );
  }

  if (!data.password) {
    throw new Error("E' necessario fornire una password");
  }

  // Hash della password
  const hashedPassword = hash(data.password);

  const user = {
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    email: data.email || "",
    password: hashedPassword,
  };

  return add(user);
};
