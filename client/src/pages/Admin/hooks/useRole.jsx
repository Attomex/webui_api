import { useState, useEffect } from "react";
import api from "../../../utils/api";

export function useRole() {
    const [role, setRole] = useState(null);

    useEffect(() => {
        api()
            .get("/admin/getRole")
            .then((response) => {
                setRole(response.data.role);
            })
            .catch((error) => {
                console.error("There was an error fetching the role!", error);
            });
            console.log(role);
    }, []);

    return role;
}
