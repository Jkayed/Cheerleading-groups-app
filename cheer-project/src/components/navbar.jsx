import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import { doSignOut } from "../firebase/auth";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

function NavigationBar() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await doSignOut();
    navigate("/login"); // Redirect to login after signing out
  };

  return (
    <Navbar>
      <NavbarBrand>
        Logo
        <p className="font-bold text-inherit">ACME</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/find-group">
            Find a Group
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/managed-groups">
            Manage Groups
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/messages">
            Messages
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        {userLoggedIn ? (
          <NavbarItem className="hidden lg:flex">
            <Button color="error" onClick={handleSignOut}>
              Sign out
            </Button>
          </NavbarItem>
        ) : (
          ""
        )}
        {!userLoggedIn ? (
          <NavbarItem>
            <Button as={Link} color="primary" href="#" variant="flat">
              Sign Up
            </Button>
          </NavbarItem>
        ) : (
          ""
        )}
      </NavbarContent>
    </Navbar>
  );
}

export default NavigationBar;
