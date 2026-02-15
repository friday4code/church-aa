'use client';

import React from 'react';
import {
  Dialog,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Portal,
} from '@chakra-ui/react';
import { DocumentDownload, CloseCircle } from 'iconsax-reactjs';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hierarchy: string, reportType: 'defaulters' | 'full') => void;
  isDownloading: boolean;
  defaultersCount: number;
  fullCount: number;
}

const HIERARCHY_OPTIONS = [
  { value: 'state', label: 'State', description: 'Group by states (highest level)' },
  { value: 'region', label: 'Region', description: 'Group by regions under states' },
  { value: 'old_group', label: 'Old Group', description: 'Group by old groups of districts' },
  { value: 'group', label: 'Group', description: 'Group by current groups' },
  { value: 'district', label: 'District', description: 'Group by districts (lowest level)' },
];

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDownloading,
  defaultersCount,
  fullCount,
}) => {
  const [selectedHierarchy, setSelectedHierarchy] = React.useState('group');
  const [selectedReportType, setSelectedReportType] = React.useState<'defaulters' | 'full'>('defaulters');

  React.useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, current hierarchy:', selectedHierarchy);
    }
  }, [isOpen, selectedHierarchy]);

  React.useEffect(() => {
    console.log('Hierarchy state changed to:', selectedHierarchy);
  }, [selectedHierarchy]);

  const handleConfirm = () => {
    console.log('Confirming with hierarchy:', selectedHierarchy, 'report type:', selectedReportType);
    onConfirm(selectedHierarchy, selectedReportType);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose} size="md">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content rounded="xl" p={6}>
            <Dialog.Header>
              <HStack justify="space-between" align="center">
                <Dialog.Title fontSize="xl" fontWeight="bold">
                  Download Report
                </Dialog.Title>
                <Button variant="ghost" onClick={onClose} p={0} h="auto">
                  <CloseCircle />
                </Button>
              </HStack>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap="6" align="stretch">
                {/* Hierarchy Selection - Custom Radio Implementation */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Select Grouping Hierarchy
                  </Text>
                  <VStack align="stretch" gap={3}>
                    {HIERARCHY_OPTIONS.map((option) => (
                      <Box
                        key={option.value}
                        as="label"
                        cursor="pointer"
                        w="full"
                      >
                        <HStack
                          w="full"
                          p={3}
                          border="1px solid"
                          borderColor={selectedHierarchy === option.value ? 'blue.500' : 'gray.200'}
                          rounded="md"
                          bg={selectedHierarchy === option.value ? 'blue.50' : 'transparent'}
                          _hover={{
                            bg: selectedHierarchy === option.value ? 'blue.100' : 'gray.50',
                            borderColor: selectedHierarchy === option.value ? 'blue.600' : 'gray.300',
                          }}
                          transition="all 0.2s"
                          onClick={() => {
                            console.log('Selected hierarchy:', option.value);
                            setSelectedHierarchy(option.value);
                          }}
                        >
                          <Box
                            w="1.2em"
                            h="1.2em"
                            borderRadius="full"
                            border="2px solid"
                            borderColor={selectedHierarchy === option.value ? 'blue.500' : 'gray.400'}
                            bg={selectedHierarchy === option.value ? 'blue.500' : 'transparent'}
                            mr={3}
                          />
                          <VStack align="start" gap={1} flex="1">
                            <Text 
                              fontWeight="medium"
                              color={selectedHierarchy === option.value ? 'blue.700' : 'gray.800'}
                            >
                              {option.label}
                            </Text>
                            <Text 
                              fontSize="sm" 
                              color={selectedHierarchy === option.value ? 'blue.600' : 'gray.600'}
                            >
                              {option.description}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                  <Text mt={2} fontSize="sm" color="blue.500" fontWeight="medium">
                    Selected: {HIERARCHY_OPTIONS.find(o => o.value === selectedHierarchy)?.label || selectedHierarchy}
                  </Text>
                </Box>

                {/* Report Type Selection */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Report Type
                  </Text>
                  <HStack gap={4}>
                    <Button
                      flex={1}
                      variant={selectedReportType === 'defaulters' ? 'solid' : 'outline'}
                      colorPalette="red"
                      onClick={() => setSelectedReportType('defaulters')}
                      size="lg"
                      height="auto"
                      py={3}
                      bg={selectedReportType === 'defaulters' ? 'red.500' : 'transparent'}
                      color={selectedReportType === 'defaulters' ? 'white' : 'red.600'}
                      borderColor="red.200"
                      _hover={{
                        bg: selectedReportType === 'defaulters' ? 'red.600' : 'red.50',
                      }}
                    >
                      <VStack gap={1}>
                        <Text>Defaulters Only</Text>
                        <Badge 
                          colorPalette="red" 
                          fontSize="sm"
                          bg={selectedReportType === 'defaulters' ? 'white' : 'red.100'}
                          color={selectedReportType === 'defaulters' ? 'red.700' : 'red.700'}
                        >
                          {defaultersCount} items
                        </Badge>
                      </VStack>
                    </Button>
                    <Button
                      flex={1}
                      variant={selectedReportType === 'full' ? 'solid' : 'outline'}
                      colorPalette="blue"
                      onClick={() => setSelectedReportType('full')}
                      size="lg"
                      height="auto"
                      py={3}
                      bg={selectedReportType === 'full' ? 'blue.500' : 'transparent'}
                      color={selectedReportType === 'full' ? 'white' : 'blue.600'}
                      borderColor="blue.200"
                      _hover={{
                        bg: selectedReportType === 'full' ? 'blue.600' : 'blue.50',
                      }}
                    >
                      <VStack gap={1}>
                        <Text>Full Report</Text>
                        <Badge 
                          colorPalette="blue" 
                          fontSize="sm"
                          bg={selectedReportType === 'full' ? 'white' : 'blue.100'}
                          color={selectedReportType === 'full' ? 'blue.700' : 'blue.700'}
                        >
                          {fullCount} items
                        </Badge>
                      </VStack>
                    </Button>
                  </HStack>
                </Box>

                {/* Summary */}
                <Box
                  p={4}
                  bg="blue.50"
                  rounded="md"
                  border="1px"
                  borderColor="blue.200"
                >
                  <VStack align="start" gap={2}>
                    <Text fontWeight="semibold" color="blue.800">Report Summary</Text>
                    <Text fontSize="sm" color="blue.700">
                      • Grouping by: <strong>{HIERARCHY_OPTIONS.find(o => o.value === selectedHierarchy)?.label}</strong>
                    </Text>
                    <Text fontSize="sm" color="blue.700">
                      • Report type: <strong>{selectedReportType === 'defaulters' ? 'Defaulters Only' : 'Full Report'}</strong>
                    </Text>
                    <Text fontSize="sm" color="blue.700">
                      • Total items: <strong>{selectedReportType === 'defaulters' ? defaultersCount : fullCount}</strong>
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={3} justify="flex-end" w="full">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  size="lg"
                  _hover={{ bg: 'gray.100' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  colorPalette="blue"
                  size="lg"
                  loading={isDownloading}
                  loadingText="Generating..."
                  display="flex"
                  gap={2}
                  bg="blue.500"
                  color="white"
                  _hover={{ bg: 'blue.600' }}
                >
                  <DocumentDownload />
                  Generate PDF
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};








// 'use client';

// import React from 'react';
// import {
//   Dialog,
//   Button,
//   VStack,
//   HStack,
//   Text,
//   RadioGroup,
//   Box,
//   Badge,
//   Portal,
// } from '@chakra-ui/react';
// import { DocumentDownload, CloseCircle } from 'iconsax-reactjs';

// interface DownloadModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: (hierarchy: string, reportType: 'defaulters' | 'full') => void;
//   isDownloading: boolean;
//   defaultersCount: number;
//   fullCount: number;
// }

// const HIERARCHY_OPTIONS = [
//   { value: 'state', label: 'State', description: 'Group by states (highest level)' },
//   { value: 'region', label: 'Region', description: 'Group by regions under states' },
//   { value: 'old_group', label: 'Old Group', description: 'Group by old groups of districts' },
//   { value: 'group', label: 'Group', description: 'Group by current groups' },
//   { value: 'district', label: 'District', description: 'Group by districts (lowest level)' },
// ];

// export const DownloadModal: React.FC<DownloadModalProps> = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   isDownloading,
//   defaultersCount,
//   fullCount,
// }) => {
//   const [selectedHierarchy, setSelectedHierarchy] = React.useState('group');
//   const [selectedReportType, setSelectedReportType] = React.useState<'defaulters' | 'full'>('defaulters');

//   const handleConfirm = () => {
//     console.log('Confirming with hierarchy:', selectedHierarchy, 'report type:', selectedReportType);
//     onConfirm(selectedHierarchy, selectedReportType);
//   };

// const handleHierarchyChange = (details: { value: string | null }) => {
//   console.log('Hierarchy changed to:', details.value);
//   if (details.value) {
//     setSelectedHierarchy(details.value);
//   }
// };

//   return (
//     <Dialog.Root open={isOpen} onOpenChange={onClose} size="md">
//       <Portal>
//         <Dialog.Backdrop />
//         <Dialog.Positioner>
//           <Dialog.Content rounded="xl" p={6}>
//             <Dialog.Header>
//               <HStack justify="space-between" align="center">
//                 <Dialog.Title fontSize="xl" fontWeight="bold">
//                   Download Report
//                 </Dialog.Title>
//                 <Button variant="ghost" onClick={onClose} p={0} h="auto">
//                   <CloseCircle />
//                 </Button>
//               </HStack>
//             </Dialog.Header>

//             <Dialog.Body>
//               <VStack gap="6" align="stretch">
//                 {/* Hierarchy Selection - Single selection radio group */}
//                 <Box>
//                   <Text fontSize="md" fontWeight="semibold" mb={3}>
//                     Select Grouping Hierarchy
//                   </Text>
//                   <RadioGroup.Root
//                     value={selectedHierarchy}
//                     onValueChange={handleHierarchyChange}
//                     colorPalette="blue"
//                   >
//                     <VStack align="stretch" gap={3}>
//                       {HIERARCHY_OPTIONS.map((option) => (
//                         <RadioGroup.Item
//                           key={option.value}
//                           value={option.value}
//                           cursor="pointer"
//                         >
//                           <HStack
//                             w="full"
//                             p={3}
//                             border="1px solid"
//                             borderColor={selectedHierarchy === option.value ? 'blue.500' : 'gray.200'}
//                             rounded="md"
//                             bg={selectedHierarchy === option.value ? 'blue.50' : 'transparent'}
//                             _hover={{
//                               bg: selectedHierarchy === option.value ? 'blue.100' : 'gray.50',
//                               borderColor: selectedHierarchy === option.value ? 'blue.600' : 'gray.300',
//                             }}
//                             transition="all 0.2s"
//                           >
//                             <RadioGroup.ItemControl 
//                               boxSize="1.2em"
//                               border="2px solid"
//                               borderColor={selectedHierarchy === option.value ? 'blue.500' : 'gray.400'}
//                               _checked={{
//                                 bg: 'blue.500',
//                                 borderColor: 'blue.500',
//                               }}
//                             />
//                             <RadioGroup.ItemText>
//                               <VStack align="start" gap={1}>
//                                 <Text 
//                                   fontWeight="medium"
//                                   color={selectedHierarchy === option.value ? 'blue.700' : 'gray.800'}
//                                 >
//                                   {option.label}
//                                 </Text>
//                                 <Text 
//                                   fontSize="sm" 
//                                   color={selectedHierarchy === option.value ? 'blue.600' : 'gray.600'}
//                                 >
//                                   {option.description}
//                                 </Text>
//                               </VStack>
//                             </RadioGroup.ItemText>
//                           </HStack>
//                         </RadioGroup.Item>
//                       ))}
//                     </VStack>
//                   </RadioGroup.Root>
//                 </Box>

//                 {/* Report Type Selection */}
//                 <Box>
//                   <Text fontSize="md" fontWeight="semibold" mb={3}>
//                     Report Type
//                   </Text>
//                   <HStack gap={4}>
//                     <Button
//                       flex={1}
//                       variant={selectedReportType === 'defaulters' ? 'solid' : 'outline'}
//                       colorPalette="red"
//                       onClick={() => setSelectedReportType('defaulters')}
//                       size="lg"
//                       height="auto"
//                       py={3}
//                       bg={selectedReportType === 'defaulters' ? 'red.500' : 'transparent'}
//                       color={selectedReportType === 'defaulters' ? 'white' : 'red.600'}
//                       borderColor="red.200"
//                       _hover={{
//                         bg: selectedReportType === 'defaulters' ? 'red.600' : 'red.50',
//                       }}
//                     >
//                       <VStack gap={1}>
//                         <Text>Defaulters Only</Text>
//                         <Badge 
//                           colorPalette="red" 
//                           fontSize="sm"
//                           bg={selectedReportType === 'defaulters' ? 'white' : 'red.100'}
//                           color={selectedReportType === 'defaulters' ? 'red.700' : 'red.700'}
//                         >
//                           {defaultersCount} items
//                         </Badge>
//                       </VStack>
//                     </Button>
//                     <Button
//                       flex={1}
//                       variant={selectedReportType === 'full' ? 'solid' : 'outline'}
//                       colorPalette="blue"
//                       onClick={() => setSelectedReportType('full')}
//                       size="lg"
//                       height="auto"
//                       py={3}
//                       bg={selectedReportType === 'full' ? 'blue.500' : 'transparent'}
//                       color={selectedReportType === 'full' ? 'white' : 'blue.600'}
//                       borderColor="blue.200"
//                       _hover={{
//                         bg: selectedReportType === 'full' ? 'blue.600' : 'blue.50',
//                       }}
//                     >
//                       <VStack gap={1}>
//                         <Text>Full Report</Text>
//                         <Badge 
//                           colorPalette="blue" 
//                           fontSize="sm"
//                           bg={selectedReportType === 'full' ? 'white' : 'blue.100'}
//                           color={selectedReportType === 'full' ? 'blue.700' : 'blue.700'}
//                         >
//                           {fullCount} items
//                         </Badge>
//                       </VStack>
//                     </Button>
//                   </HStack>
//                 </Box>

//                 {/* Summary */}
//                 <Box
//                   p={4}
//                   bg="blue.50"
//                   rounded="md"
//                   border="1px"
//                   borderColor="blue.200"
//                 >
//                   <VStack align="start" gap={2}>
//                     <Text fontWeight="semibold" color="blue.800">Report Summary</Text>
//                     <Text fontSize="sm" color="blue.700">
//                       • Grouping by: <strong>{HIERARCHY_OPTIONS.find(o => o.value === selectedHierarchy)?.label}</strong>
//                     </Text>
//                     <Text fontSize="sm" color="blue.700">
//                       • Report type: <strong>{selectedReportType === 'defaulters' ? 'Defaulters Only' : 'Full Report'}</strong>
//                     </Text>
//                     <Text fontSize="sm" color="blue.700">
//                       • Total items: <strong>{selectedReportType === 'defaulters' ? defaultersCount : fullCount}</strong>
//                     </Text>
//                   </VStack>
//                 </Box>
//               </VStack>
//             </Dialog.Body>

//             <Dialog.Footer>
//               <HStack gap={3} justify="flex-end" w="full">
//                 <Button 
//                   variant="outline" 
//                   onClick={onClose} 
//                   size="lg"
//                   _hover={{ bg: 'gray.100' }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleConfirm}
//                   colorPalette="blue"
//                   size="lg"
//                   loading={isDownloading}
//                   loadingText="Generating..."
//                   display="flex"
//                   gap={2}
//                   bg="blue.500"
//                   color="white"
//                   _hover={{ bg: 'blue.600' }}
//                 >
//                   <DocumentDownload />
//                   Generate PDF
//                 </Button>
//               </HStack>
//             </Dialog.Footer>
//           </Dialog.Content>
//         </Dialog.Positioner>
//       </Portal>
//     </Dialog.Root>
//   );
// };

