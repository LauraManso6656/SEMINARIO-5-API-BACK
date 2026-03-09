import mongoose from 'mongoose';
import Usuario, { IUsuarioModel, IUsuario } from '../models/Usuario';
import Organizacion from '../models/Organizacion'; 

const createUsuario = async (data: Partial<IUsuario>): Promise<IUsuarioModel> => {
    const usuario = new Usuario({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });
    const savedUsuario = await usuario.save();

    //añadido para actualizar la organización con el nuevo usuario. ayuda de ia utilizada.
    if (savedUsuario.organizacion) {
        await Organizacion.findByIdAndUpdate(savedUsuario.organizacion, {
            $push: { usuarios: savedUsuario._id }
        });
    }
    return savedUsuario;
};

const updateUsuario = async (usuarioId: string, data: Partial<IUsuario>): Promise<IUsuarioModel | null> => {
    const usuarioActual = await Usuario.findById(usuarioId);
    if (!usuarioActual) return null;

    // si cambia de organizacion, actualizamos las relaciones. ayuda de ia utilizada.
    if (data.organizacion && data.organizacion.toString() !== usuarioActual.organizacion?.toString()) {
        await Organizacion.findByIdAndUpdate(usuarioActual.organizacion, { $pull: { usuarios: usuarioId } });
        await Organizacion.findByIdAndUpdate(data.organizacion, { $push: { usuarios: usuarioId } });
    }

    usuarioActual.set(data);
    return await usuarioActual.save();
};


const getUsuario = async (usuarioId: string): Promise<IUsuarioModel | null> => {
    return await Usuario.findById(usuarioId).populate('organizacion');
};

const getAllUsuarios = async (): Promise<IUsuarioModel[]> => {
    return await Usuario.find().populate('organizacion');
};

const deleteUsuario = async (usuarioId: string): Promise<IUsuarioModel | null> => {
    const usuario = await Usuario.findById(usuarioId);
    if (usuario?.organizacion) {
        await Organizacion.findByIdAndUpdate(usuario.organizacion, { $pull: { usuarios: usuarioId } });
    }
    return await Usuario.findByIdAndDelete(usuarioId);
};

export default { createUsuario, getUsuario, getAllUsuarios, updateUsuario, deleteUsuario };