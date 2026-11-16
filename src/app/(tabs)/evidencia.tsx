import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export interface Mission {
  id: string | number;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  progress: number;
}

export interface CameraModalProps {
  visible: boolean;
  mission: Mission | null;
  onClose: () => void;
  onSuccess: (missionId: string | number, photoUri: string) => void;
}


export const CameraVerificationModal: React.FC<CameraModalProps> = ({
  visible,
  mission,
  onClose,
  onSuccess,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!visible) {
      setPhotoUri(null);
      setIsCapturing(false);
      setIsSubmitting(false);
    }
  }, [visible]);

  if (!mission) return null;

  const handleTakePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: true,
        });
        setPhotoUri(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'No se pudo tomar la fotografía. Inténtalo de nuevo.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  const handleConfirmAndComplete = async () => {
    if (!photoUri) return;
    setIsSubmitting(true);
    
    // Simulación de envío de evidencia al servidor
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(mission.id, photoUri);
      onClose();
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={modalStyles.container}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
            <Ionicons name="close" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle}>Verificación de Misión</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={modalStyles.missionCard}>
          <Text style={modalStyles.missionTitle}>{mission.title}</Text>
          <Text style={modalStyles.missionDescription}>{mission.description}</Text>
          <View style={modalStyles.rewardBadge}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={modalStyles.rewardText}>+{mission.xp} XP</Text>
          </View>
        </View>

        <View style={modalStyles.cameraPreviewContainer}>
          {!permission ? (
            <View style={modalStyles.centeredContent}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : !permission.granted ? (
            <View style={modalStyles.permissionBox}>
              <Ionicons name="camera-outline" size={48} color="#64748B" />
              <Text style={modalStyles.permissionText}>
                Se requiere acceso a la cámara para capturar la evidencia de la misión.
              </Text>
              <TouchableOpacity style={modalStyles.permissionButton} onPress={requestPermission}>
                <Text style={modalStyles.permissionButtonText}>Otorgar Permiso</Text>
              </TouchableOpacity>
            </View>
          ) : photoUri ? (
            <View style={modalStyles.imagePreviewWrapper}>
              <Image source={{ uri: photoUri }} style={modalStyles.previewImage} resizeMode="cover" />
              <View style={modalStyles.successBadgeContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={modalStyles.successBadgeText}>Evidencia Capturada</Text>
              </View>
            </View>
          ) : (
            <CameraView ref={cameraRef} style={modalStyles.camera} facing="back">
              <View style={modalStyles.overlayGuide}>
                <Text style={modalStyles.overlayGuideText}>Encuadra el objeto o acción requerida</Text>
              </View>
            </CameraView>
          )}
        </View>

        <View style={modalStyles.actionFooter}>
          {!photoUri ? (
            <TouchableOpacity
              style={[
                modalStyles.captureButton,
                (!permission?.granted || isCapturing) && modalStyles.disabledButton,
              ]}
              onPress={handleTakePicture}
              disabled={!permission?.granted || isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="camera" size={22} color="#FFFFFF" />
                  <Text style={modalStyles.captureButtonText}>Capturar Evidencia</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={modalStyles.dualButtonRow}>
              <TouchableOpacity
                style={modalStyles.retakeButton}
                onPress={handleRetake}
                disabled={isSubmitting}
              >
                <Ionicons name="refresh" size={20} color="#64748B" />
                <Text style={modalStyles.retakeButtonText}>Tomar otra foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[modalStyles.submitButton, isSubmitting && modalStyles.disabledButton]}
                onPress={handleConfirmAndComplete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                    <Text style={modalStyles.submitButtonText}>Completar Misión</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  closeButton: { padding: 8, borderRadius: 8 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  missionCard: { margin: 16, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  missionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  missionDescription: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
  rewardBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, gap: 4 },
  rewardText: { fontSize: 13, fontWeight: '700', color: '#B45309' },
  cameraPreviewContainer: { flex: 1, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#0F172A', position: 'relative' },
  camera: { flex: 1 },
  overlayGuide: { position: 'absolute', top: 16, left: 16, right: 16, backgroundColor: 'rgba(15, 23, 42, 0.65)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, alignItems: 'center' },
  overlayGuideText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  imagePreviewWrapper: { flex: 1, position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  successBadgeContainer: { position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  successBadgeText: { color: '#065F46', fontSize: 13, fontWeight: '600' },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF' },
  permissionText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginVertical: 16, lineHeight: 20 },
  permissionButton: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  actionFooter: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  captureButton: { backgroundColor: '#2563EB', height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  captureButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  dualButtonRow: { flexDirection: 'row', gap: 12 },
  retakeButton: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  retakeButtonText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  submitButton: { flex: 1.5, height: 50, borderRadius: 12, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
});