import React, { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface Character {
  name: string;
  email: string;
  designation: string;
}

interface AddCharactersStepProps {
  characters: Character[];
  addCharacter: (character: Character) => void;
}

const AddCharactersStep: React.FC<AddCharactersStepProps> = ({ characters, addCharacter }) => {
  const [form, setForm] = useState<Character>({ name: '', email: '', designation: '' });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Character>({ name: '', email: '', designation: '' });
  const [charList, setCharList] = useState<Character[]>(characters);

  // Sync charList with characters prop
  React.useEffect(() => {
    setCharList(characters);
  }, [characters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.designation) {
      addCharacter(form);
      setForm({ name: '', email: '', designation: '' });
    }
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditForm(charList[idx]);
  };

  const handleEditSave = () => {
    if (editForm.name && editForm.email && editForm.designation && editIndex !== null) {
      const updated = [...charList];
      updated[editIndex] = editForm;
      setCharList(updated);
      setEditIndex(null);
    }
  };

  const handleEditCancel = () => {
    setEditIndex(null);
  };

  const handleDelete = (idx: number) => {
    const updated = charList.filter((_, i) => i !== idx);
    setCharList(updated);
  };

  return (
    <div className="flex gap-8">
      {/* Characters Table */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6 text-black">Characters</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">E-mail</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Designation</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {charList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 text-lg font-medium">No data available</td>
                </tr>
              ) : (
                charList.map((char, idx) => (
                  <tr key={idx} className="border-t">
                    {editIndex === idx ? (
                      <>
                        <td className="px-6 py-4"><input name="name" value={editForm.name} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-black" /></td>
                        <td className="px-6 py-4"><input name="email" value={editForm.email} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-black" /></td>
                        <td className="px-6 py-4"><input name="designation" value={editForm.designation} onChange={handleEditChange} className="w-full px-2 py-1 border rounded text-black" /></td>
                        <td className="px-6 py-4 flex gap-2">
                          <button type="button" onClick={handleEditSave} className="p-1 rounded bg-green-100 hover:bg-green-200"><Check className="w-4 h-4 text-green-700" /></button>
                          <button type="button" onClick={handleEditCancel} className="p-1 rounded bg-gray-100 hover:bg-gray-200"><X className="w-4 h-4 text-gray-700" /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-black font-medium">{char.name}</td>
                        <td className="px-6 py-4 text-black">{char.email}</td>
                        <td className="px-6 py-4 text-black">{char.designation}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button type="button" onClick={() => handleEdit(idx)} className="p-1 rounded bg-blue-100 hover:bg-blue-200"><Edit2 className="w-4 h-4 text-blue-700" /></button>
                          <button type="button" onClick={() => handleDelete(idx)} className="p-1 rounded bg-red-100 hover:bg-red-200"><Trash2 className="w-4 h-4 text-red-700" /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Character Form */}
      <div className="w-full max-w-xs bg-white rounded-2xl shadow p-8 border border-gray-100 flex flex-col justify-between">
        <h3 className="text-xl font-bold mb-6 text-black">Add Characters</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">Name*</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">E-mail*</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">Designation*</label>
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-6 w-full py-2 rounded-full bg-gray-900 text-white font-semibold text-lg shadow hover:bg-gray-800 transition"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCharactersStep; 