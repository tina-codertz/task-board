import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom';



export default function ProtectedRoutes({children, roles}){
    const {user, loading} = useAuth();

    if (loading) return <p>Loading...</p>;
    if (!user){
        //then the user is not login therefore go to login page
        return<Navigate to="/"/>;
    }
    if(roles && !roles.includes(user.role)){
        //then you have logged in but with the wrong role redirect to login again
        return <Navigate to="/"/>
    }


}