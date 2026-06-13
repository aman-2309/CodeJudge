import React, { useState } from 'react';
import { Plus, Edit, Trash2, Video } from 'lucide-react';
import { NavLink } from 'react-router';
import { motion } from 'framer-motion';

function Admin() {
  const [selectedOption, setSelectedOption] = useState(null);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      iconColor: 'text-[#2cbb5d]',
      bgColor: 'bg-[#2cbb5d]/10',
      btnClass: 'btn-success',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      iconColor: 'text-[#ffc01e]',
      bgColor: 'bg-[#ffc01e]/10',
      btnClass: 'btn-warning',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      iconColor: 'text-[#ff375f]',
      bgColor: 'bg-[#ff375f]/10',
      btnClass: 'btn-error',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Add Video',
      description: 'Add video solution to the platform',
      icon: Video,
      iconColor: 'text-[#2cbb5d]',
      bgColor: 'bg-[#2cbb5d]/10',
      btnClass: 'btn-success',
      route: '/admin/video'
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#e0e0e0] mb-4">
            Admin Panel
          </h1>
          <p className="text-[#8a8a8a] text-lg">
            Manage coding problems on your platform
          </p>
        </motion.div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {adminOptions.map((option, idx) => {
            const IconComponent = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.07, 0.4) }}
                whileHover={{ scale: 1.005 }}
                className="card bg-[#262626] border border-[#3a3a3a] rounded-lg transition-colors duration-150 hover:border-[#4a4a4a] hover:bg-[#2d2d2d] cursor-pointer"
              >
                <div className="card-body items-center text-center p-8">
                  {/* Icon */}
                  <div className={`${option.bgColor} p-4 rounded-lg mb-4`}>
                    <IconComponent size={32} className={option.iconColor} />
                  </div>

                  {/* Title */}
                  <h2 className="card-title text-xl mb-2 text-[#e0e0e0]">
                    {option.title}
                  </h2>

                  {/* Description */}
                  <p className="text-[#8a8a8a] mb-6 text-sm">
                    {option.description}
                  </p>

                  {/* Action Button */}
                  <div className="card-actions">
                    <NavLink
                      to={option.route}
                      className={`btn ${option.btnClass} btn-wide rounded-md`}
                    >
                      {option.title}
                    </NavLink>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;