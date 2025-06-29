import React from 'react'
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaClipboardList, FaGraduationCap, FaSignOutAlt, FaTasks, FaUser } from 'react-icons/fa';
import { IoMdCalendar } from 'react-icons/io';

const StudentDashbaord = () => {
    const { session } = useAuth();

    return (

        <div className="bg-gray-100 h-screen">
            <div className="p-4">
                <div className="grid grid-cols-4 gap-6 mb-6">
                    <Link to='/' className="bg-white text-black p-6 rounded-lg shadow flex flex-col justify-center">
                        <div className="flex items-center gap-6">
                            <div className="rounded-full bg-cyan-300/25 p-4">
                                <FaTasks className="text-xl" />
                            </div>
                            <div className="">
                                <p className='text-3xl font-bold'>10</p>
                                <p>Total Quizzes</p>
                            </div>
                        </div>
                    </Link>
                    <Link to='/' className="bg-white text-black p-6 rounded-lg shadow flex flex-col justify-center">
                        <div className="flex items-center gap-6">
                            <div className="rounded-full bg-purple-300/50 p-4">
                                <FaTasks className="text-xl" />
                            </div>
                            <div className="">
                                <p className='text-3xl font-bold'>10</p>
                                <p>Total Materials</p>
                            </div>
                        </div>
                    </Link>
                    <div className="bg-white text-black p-6 rounded-lg shadow flex flex-col justify-center col-span-2">
                        <div className="flex items-center gap-6">
                            <div className="rounded-full bg-blue-300/50 p-4">
                                <FaUser className="text-xl" />
                            </div>
                            <div className="">
                                <p className='text-3xl font-bold'>{session?.user?.email}</p>
                                <p>Student</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="bg-white text-black p-6 rounded-lg shadow flex flex-col justify-between w-full">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">June 2025</h3>
                            <IoMdCalendar className="text-xl" />
                        </div>
                        <div className="grid grid-cols-7 text-center text-gray-500 text-sm mb-2">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 text-center text-sm gap-1">
                            {Array.from({ length: 30 }, (_, i) => (
                                <div
                                    key={i}
                                    className="py-1 text-gray-700 hover:bg-gray-200 rounded cursor-default"
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white text-black p-6 rounded-lg shadow justify-between w-full">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Student</h3>
                        </div>
                        <div className="">
                            <table className="text-sm text-left w-full">
                                <thead>
                                    <tr className="text-gray-600 border-b">
                                        <th>Name</th>
                                        <th>Subject</th>
                                        <th>Class</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2 flex items-center gap-2">
                                            <img src={`https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`} className="w-6 h-6 rounded-full" />
                                            Teacher Example
                                        </td>
                                        <td>English</td>
                                        <td>Science-A, Science-B</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashbaord
