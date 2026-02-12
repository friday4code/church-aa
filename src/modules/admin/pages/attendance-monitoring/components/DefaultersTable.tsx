'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Button,
  Spinner,
  Grid,
  Accordion,
  Badge,
} from '@chakra-ui/react';
import { DocumentDownload } from 'iconsax-reactjs';
import { getStatusBadge } from '@/lib/calendar-utils';
import { generateDefaultersPDF } from '@/lib/pdf-generator';

interface DefaultersTableProps {
  isLoading: boolean;
  groupedItems: {
    red: {
      states: any[];
      regions: any[];
      districts: any[];
      groups: any[];
      old_groups: any[];
    };
    orange: {
      states: any[];
      regions: any[];
      districts: any[];
      groups: any[];
      old_groups: any[];
    };
    yellow: {
      states: any[];
      regions: any[];
      districts: any[];
      groups: any[];
      old_groups: any[];
    };
    green: {
      states: any[];
      regions: any[];
      districts: any[];
      groups: any[];
      old_groups: any[];
    };
  };
  canView: (hierarchy: string) => boolean;
  allDefaultersCount: number;
  onDownload: () => void;
  isDownloading: boolean;

  // Add these new props
  reportType: 'defaulters' | 'full';
  setReportType: (type: 'defaulters' | 'full') => void;
  defaultersCount: number;
  fullCount: number;
}

const DefaultersTable: React.FC<DefaultersTableProps> = ({
  isLoading,
  groupedItems,
  canView,
  allDefaultersCount,
  onDownload,
  isDownloading,

  reportType,
  setReportType,
  defaultersCount,
  fullCount,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'red' | 'orange' | 'yellow' | 'green'>('all');
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());



  // Count items for each status
  // const statusCounts = useMemo(() => {
  //   const counts = {
  //     all: allDefaultersCount,
  //     red: 0,
  //     orange: 0,
  //     yellow: 0,
  //     green: 0,
  //   };

  //   const countStatus = (status: keyof typeof groupedItems) => {
  //     return (
  //       groupedItems[status].states.length +
  //       groupedItems[status].regions.length +
  //       groupedItems[status].districts.length +
  //       groupedItems[status].groups.length +
  //       groupedItems[status].old_groups.length
  //     );
  //   };

  //   counts.red = countStatus('red');
  //   counts.orange = countStatus('orange');
  //   counts.yellow = countStatus('yellow');
  //   counts.green = countStatus('green');

  //   return counts;
  // }, [groupedItems, allDefaultersCount]);

   const statusCounts = useMemo(() => {
    const counts = {
      all: allDefaultersCount, // This should be total districts count from parent
      red: 0,
      orange: 0,
      yellow: 0,
      green: 0,
    };

    // Only count districts, ignore states, regions, groups, old_groups
    counts.red = groupedItems.red.districts.length;
    counts.orange = groupedItems.orange.districts.length;
    counts.yellow = groupedItems.yellow.districts.length;
    counts.green = groupedItems.green.districts.length;

    return counts;
  }, [groupedItems, allDefaultersCount]);


  const toggleLevel = (level: string) => {
    const newSet = new Set(expandedLevels);
    if (newSet.has(level)) {
      newSet.delete(level);
    } else {
      newSet.add(level);
    }
    setExpandedLevels(newSet);
  };

  // In DefaultersTable.tsx, update the StatusSection component

  // In DefaultersTable.tsx, update the StatusSection to correctly display status labels

const StatusSection = ({ status, label }: { status: 'red' | 'orange' | 'yellow' | 'green'; label: string }) => {
    const statusInfo = getStatusBadge(status);
    const items = groupedItems[status];
    
    // Get the correct label based on status
    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'red': return 'No Submission';
            case 'orange': return '2+ Weeks Late';
            case 'yellow': return '1 Week Late';
            case 'green': return 'Up to Date';
            default: return statusInfo.label;
        }
    };

    const hierarchies = [
        { key: 'districts', label: 'Districts', data: items.districts },
        // Add other hierarchies if needed
    ];

    const visibleHierarchies = hierarchies.filter(
        (h) => h.data.length > 0 && canView(h.label.slice(0, -1))
    );

    if (visibleHierarchies.length === 0) return null;

    return (
        <Box
            p="6"
            bg={{ base: 'gray.50', _dark: 'gray.900' }}
            border="1px"
            borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
            rounded="lg"
        >
            <HStack justify="space-between" mb="6">
                <HStack gap="3">
                    <Text fontSize="2xl">{statusInfo.emoji}</Text>
                    <VStack align="start" gap="0">
                        <Heading size="md">{getStatusLabel(status)}</Heading>
                        <Text fontSize="sm" color={{ base: 'gray.600', _dark: 'gray.400' }}>
                            {items.districts.length} districts
                        </Text>
                    </VStack>
                </HStack>
                <Badge
                    colorPalette={status === 'red' ? 'red' : status === 'orange' ? 'orange' : status === 'yellow' ? 'yellow' : 'green'}
                    fontSize="lg"
                    px="4"
                    py="2"
                >
                    {items.districts.length}
                </Badge>
            </HStack>

            <Accordion.Root collapsible>
                {visibleHierarchies.map((hierarchy) => (
                    <Accordion.Item key={hierarchy.key} value={hierarchy.key}>
                        <Accordion.ItemTrigger>
                            <HStack w="full" justify="space-between">
                                <Text fontWeight="semibold" fontSize="lg">
                                    {hierarchy.label}
                                </Text>
                                <Badge colorPalette="gray">{hierarchy.data.length}</Badge>
                            </HStack>
                        </Accordion.ItemTrigger>
                        <Accordion.ItemContent>
                            <VStack align="stretch" gap="3" pt="4">
                                {hierarchy.data.map((item) => (
                                    <Box
                                        key={item.id}
                                        p="4"
                                        bg={{ base: 'white', _dark: 'gray.800' }}
                                        border="1px"
                                        borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
                                        rounded="md"
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        _hover={{
                                            bg: { base: 'gray.50', _dark: 'gray.700' },
                                            transition: 'background-color 0.2s',
                                        }}
                                    >
                                        <VStack align="start" gap="1" flex="1">
                                            <Text fontSize="lg" fontWeight="500">
                                                {item.name}
                                            </Text>
                                            <Text fontSize="sm" color={{ base: 'gray.600', _dark: 'gray.400' }}>
                                                Last submitted: {item.last_filled_week === 0 ? 'Never' : `Week ${item.last_filled_week}`}
                                            </Text>
                                        </VStack>
                                        <Badge colorPalette={status}>
                                            {item.last_filled_week === 0 ? 'Never' : `Week ${item.last_filled_week}`}
                                        </Badge>
                                    </Box>
                                ))}
                            </VStack>
                        </Accordion.ItemContent>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </Box>
    );
};

  if (isLoading) {
    return (
      <Box textAlign="center" py="10">
        <Spinner size="lg" mb="4" />
        <Text fontSize="lg">Loading attendance data...</Text>
      </Box>
    );
  }

  if (statusCounts.all === 0) {
    return (
      <Box textAlign="center" py="10" bg={{ base: 'green.50', _dark: 'green.900' }} rounded="lg">
        <Text fontSize="2xl" fontWeight="bold" mb="2">
          ✓ All attendance is up to date!
        </Text>
        <Text color={{ base: 'gray.600', _dark: 'gray.400' }} fontSize="lg">
          No defaulters to display.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap="6">
      {/* Filter Buttons */}
      <Box>
        <Text fontSize="sm" fontWeight="semibold" mb="3" color={{ base: 'gray.600', _dark: 'gray.400' }}>
          Filter by Status
        </Text>
        <HStack gap="2" flexWrap="wrap">
          <Button
            variant={activeFilter === 'all' ? 'solid' : 'outline'}
            colorPalette="blue"
            onClick={() => setActiveFilter('all')}
            size="md"
          >
            All ({statusCounts.all})
          </Button>
          {statusCounts.red > 0 && (
            <Button
              variant={activeFilter === 'red' ? 'solid' : 'outline'}
              colorPalette="red"
              onClick={() => setActiveFilter('red')}
              size="md"
            >
              Red ({statusCounts.red})
            </Button>
          )}
          {statusCounts.orange > 0 && (
            <Button
              variant={activeFilter === 'orange' ? 'solid' : 'outline'}
              colorPalette="orange"
              onClick={() => setActiveFilter('orange')}
              size="md"
            >
              Orange ({statusCounts.orange})
            </Button>
          )}
          {statusCounts.yellow > 0 && (
            <Button
              variant={activeFilter === 'yellow' ? 'solid' : 'outline'}
              colorPalette="yellow"
              onClick={() => setActiveFilter('yellow')}
              size="md"
            >
              Yellow ({statusCounts.yellow})
            </Button>
          )}
          {statusCounts.green > 0 && (
            <Button
              variant={activeFilter === 'green' ? 'solid' : 'outline'}
              colorPalette="green"
              onClick={() => setActiveFilter('green')}
              size="md"
            >
              Green ({statusCounts.green})
            </Button>
          )}
        </HStack>
        
      </Box>

       {/* Report Type Selector and Download Button */}
      {/* {statusCounts.all > 0 && (
        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb="3" color={{ base: 'gray.600', _dark: 'gray.400' }}>
            Report Options
          </Text>
          <HStack justify="space-between" align="center" wrap="wrap" gap="4">
            <HStack gap="2">
              <Button
                size="md"
                variant={reportType === 'defaulters' ? 'solid' : 'outline'}
                colorPalette="red"
                onClick={() => setReportType('defaulters')}
              >
                Defaulters Only ({defaultersCount})
              </Button>
              <Button
                size="md"
                variant={reportType === 'full' ? 'solid' : 'outline'}
                colorPalette="blue"
                onClick={() => setReportType('full')}
              >
                Full Report ({fullCount})
              </Button>
            </HStack>
            
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              colorPalette="blue"
              size="lg"
              display="flex"
              gap="2"
            >
              {isDownloading ? <Spinner size="sm" /> : <DocumentDownload />}
              Download {reportType === 'defaulters' ? 'Defaulters' : 'Full'} Report
            </Button>
          </HStack>
        </Box>
      )} */}
      {statusCounts.all > 0 && (
  <VStack align="stretch" gap="4">
    {/* Report Type Selector - Right Aligned */}
    <HStack justify="flex-end" align="center" wrap="wrap" gap="4">
      <HStack gap="2">
        <Text fontSize="sm" fontWeight="semibold" color={{ base: 'gray.600', _dark: 'gray.400' }}>
          Report Type:
        </Text>
        <Button
          size="md"
          variant={reportType === 'defaulters' ? 'solid' : 'outline'}
          colorPalette="red"
          onClick={() => setReportType('defaulters')}
        >
          Defaulters Only ({defaultersCount})
        </Button>
        <Button
          size="md"
          variant={reportType === 'full' ? 'solid' : 'outline'}
          colorPalette="blue"
          onClick={() => setReportType('full')}
        >
          Full Report ({fullCount})
        </Button>
      </HStack>
    </HStack>
    
    {/* Download Button - Right Aligned */}
    <HStack justify="flex-end">
      <Button
        onClick={onDownload}
        disabled={isDownloading}
        colorPalette="blue"
        size="lg"
        display="flex"
        gap="2"
      >
        {isDownloading ? <Spinner size="sm" /> : <DocumentDownload />}
        Download {reportType === 'defaulters' ? 'Defaulters' : 'Full'} Report
      </Button>
    </HStack>
  </VStack>
)}

      {/* Status Sections */}
      <VStack align="stretch" gap="6">
        {(activeFilter === 'all' || activeFilter === 'red') && <StatusSection status="red" label="Red" />}
        {(activeFilter === 'all' || activeFilter === 'orange') && <StatusSection status="orange" label="Orange" />}
        {(activeFilter === 'all' || activeFilter === 'yellow') && <StatusSection status="yellow" label="Yellow" />}
        {(activeFilter === 'all' || activeFilter === 'green') && <StatusSection status="green" label="Green" />}
      </VStack>
    </VStack>
    
  );
};

export default DefaultersTable;
