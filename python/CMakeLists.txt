cmake_minimum_required(VERSION 3.15)
project(vector_qsort LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(HWY_ENABLE_TESTS OFF CACHE BOOL "" FORCE)
set(HWY_ENABLE_EXAMPLES OFF CACHE BOOL "" FORCE)
set(HWY_ENABLE_CONTRIB ON CACHE BOOL "" FORCE)

if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/../vendor/highway/CMakeLists.txt")
  add_subdirectory("${CMAKE_CURRENT_SOURCE_DIR}/../vendor/highway" "${CMAKE_CURRENT_BINARY_DIR}/highway_build" EXCLUDE_FROM_ALL)
elseif(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/vendor/highway/CMakeLists.txt")
  add_subdirectory("${CMAKE_CURRENT_SOURCE_DIR}/vendor/highway" "${CMAKE_CURRENT_BINARY_DIR}/highway_build" EXCLUDE_FROM_ALL)
else()
  include(FetchContent)
  FetchContent_Declare(
    highway
    GIT_REPOSITORY https://github.com/google/highway.git
    GIT_TAG master
    GIT_SHALLOW TRUE
  )
  FetchContent_MakeAvailable(highway)
endif()

if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/../core/vqsort.h")
  include_directories("${CMAKE_CURRENT_SOURCE_DIR}/../core")
endif()
if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/include")
  include_directories("${CMAKE_CURRENT_SOURCE_DIR}/include")
endif()

find_package(Python 3.9 COMPONENTS Interpreter Development.Module REQUIRED)
find_package(nanobind CONFIG REQUIRED)

nanobind_add_module(_vector_qsort
  binding.cc
)

target_link_libraries(_vector_qsort PRIVATE
  hwy
  hwy_contrib
)

install(TARGETS _vector_qsort LIBRARY DESTINATION vector_qsort)
