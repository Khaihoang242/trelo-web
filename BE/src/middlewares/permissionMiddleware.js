// ~/middlewares/permissionMiddleware.js
export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
      try {
        if (!req.user || !req.user.role) {
          return res.status(401).json({ message: "Unauthorized" });
        }
  
        // Map role sang permission
        const rolePermissions = {
          admin: ["manage_users", "manage_orders", "view_reports"],
          employee: ["manage_orders", "view_reports"],
          client: ["view_products", "make_order"],
        };
  
        const userPermissions = rolePermissions[req.user.role] || [];
  
        // Kiểm tra nếu user không có quyền requiredPermission
        if (!userPermissions.includes(requiredPermission)) {
          return res.status(403).json({ message: "Forbidden: You don't have permission" });
        }
  
        next(); // user có quyền -> tiếp tục
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    };
  };
  