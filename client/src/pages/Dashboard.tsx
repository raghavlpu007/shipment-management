import React from 'react'
import {
  Package,
  Truck,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'
import { useShipments } from '../hooks/useShipments'
import LoadingSpinner from '../components/LoadingSpinner'
import { Link } from 'react-router-dom'
import Button from '../components/Button'

const Dashboard: React.FC = () => {
  // Get shipments data for analytics (fetch all for accurate stats)
  const { data: shipmentsData, isLoading } = useShipments({
    page: 1,
    limit: 1000, // Get all shipments for accurate analytics
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const shipments = shipmentsData?.data || []
  const pagination = shipmentsData?.pagination

  // Calculate analytics
  const totalRevenue = shipments.reduce((sum, s) => sum + (s.saleCost || 0), 0)
  const inTransitCount = shipments.filter(s => s.shipmentStatus === 'InTransit').length
  const pendingPaymentCount = shipments.filter(s => s.paymentStatus === 'Pending').length
  const deliveredCount = shipments.filter(s => s.shipmentStatus === 'Delivered').length

  // Recent shipments (last 5)
  const recentShipments = shipments.slice(0, 5)

  // Top destinations
  const destinationCounts = shipments.reduce((acc, shipment) => {
    const city = shipment.city || 'Unknown'
    acc[city] = (acc[city] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topDestinations = Object.entries(destinationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Overview of your shipment management system
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/shipments">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                View All Shipments
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-3xl font-bold text-gray-900">{pagination?.totalItems || 0}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-3xl font-bold text-orange-600">{inTransitCount}</p>
              <p className="text-xs text-gray-500 mt-1">Active shipments</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-3xl font-bold text-green-600">{deliveredCount}</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">All time earnings</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                Recent Shipments
              </h3>
              <Link to="/shipments">
                <Button variant="secondary" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentShipments.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No shipments yet</p>
                <Link to="/shipments">
                  <Button size="sm" className="mt-3">
                    Create First Shipment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentShipments.map((shipment) => (
                  <div key={shipment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{shipment.awb}</p>
                      <p className="text-sm text-gray-500">{shipment.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{(shipment.grandTotal || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {shipment.date ? new Date(shipment.date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 text-gray-500 mr-2" />
              Top Destinations
            </h3>
          </div>
          <div className="p-6">
            {topDestinations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No destinations data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topDestinations.map(([city, count], index) => (
                  <div key={city} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{city}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / topDestinations[0][1]) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
            Quick Actions
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/shipments">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Manage Shipments</h4>
                    <p className="text-sm text-gray-500">View, edit, and track shipments</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/field-settings">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Field Settings</h4>
                    <p className="text-sm text-gray-500">Configure form fields</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/import">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Import Data</h4>
                    <p className="text-sm text-gray-500">Bulk import shipments</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 text-gray-500 mr-2" />
            Status Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{pendingPaymentCount}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1" />
                Pending Payment
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{inTransitCount}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Truck className="h-4 w-4 mr-1" />
                In Transit
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{deliveredCount}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Package className="h-4 w-4 mr-1" />
                Delivered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
